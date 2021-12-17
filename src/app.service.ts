import {
    Logger,
    Injectable,
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';

import { Knex } from 'knex';
import { InjectModel } from 'nest-knexjs';

import {
    Car,
    CarSessionPeriodDto,
    CarSession,
    CarsUsageReport,
    CreateCarSessionDto,
} from './app.dto';

import { addDays, getDaysDiff } from './utils';


const DAYS_BETWEEN_SESSIONS = 3;
const MAX_SESSION_DAYS = 30;
const SESSION_PRICE_DISCOUNTS = [].concat(
    Array(4 - 0).fill(0), // 0%
    Array(9 - 4).fill(0.05), // 5%
    Array(17 - 9).fill(0.1), // 10%
    Array(MAX_SESSION_DAYS - 17).fill(0.15), // 15%
);
const WEEKENDS = [6, 0]; // saturday, sunday

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(@InjectModel() private readonly knex: Knex) {}

    async getCarById(id: number): Promise<Car> {
        const [car] = (await this.knex.raw(
            `SELECT * FROM cars WHERE id = ?`,
            [id],
        )).rows;

        if (!car) {
            throw new NotFoundException(`car with id ${id} not found`);
        }

        return car;
    }

    ejectAndValidateSessionPeriod(params: CarSessionPeriodDto): {
        startDate: Date,
        endDate: Date,
        sessionDays: number,
    } {
        const sd = Date.parse(params.startDate);
        const ed = Date.parse(params.endDate);
        
        if (isNaN(sd) || isNaN(ed)) {
            throw new BadRequestException('invalid dates');
        }

        const startDate = new Date(sd);
        const endDate = new Date(ed);
        const isPeriodValid = startDate < endDate
            && !WEEKENDS.includes(startDate.getDay()) // period cannot start at weekends
            && !WEEKENDS.includes(endDate.getDay());


        if (!isPeriodValid) {
            throw new BadRequestException('invalid session period');
        }

        const sessionDays = getDaysDiff(endDate, startDate);

        if (sessionDays > MAX_SESSION_DAYS) {
            throw new BadRequestException(`session period must be less than ${MAX_SESSION_DAYS} days`);
        }

        return { startDate, endDate, sessionDays };
    }

    async checkCarAvailability(id: number, params: CarSessionPeriodDto): Promise<boolean> {
        const car = await this.getCarById(id);

        if (!car.is_active) {
            return false;
        }

        const { startDate, endDate } = this.ejectAndValidateSessionPeriod(params);

        const query = `
            SELECT 1
            FROM car_sessions
            WHERE
                car_id = ?
                AND (start_date, end_date) OVERLAPS (?, ?)
        `;

        const bindings = [
            id,
            addDays(startDate, -DAYS_BETWEEN_SESSIONS),
            addDays(endDate, DAYS_BETWEEN_SESSIONS),
        ];

        const [sessionExists] = (await this.knex.raw(query, bindings)).rows;

        return !sessionExists;
    }

    async getCarPrice(id: number, params: CarSessionPeriodDto): Promise<number> {
        const { base_price: basePrice } = await this.getCarById(id);
        const { sessionDays } = this.ejectAndValidateSessionPeriod(params);
        let price = 0;
        
        for (let i = 0; i < sessionDays; i++) {
            price += basePrice - basePrice * SESSION_PRICE_DISCOUNTS[i];
        }

        return price;
    }

    async createCarSession(id: number, data: CreateCarSessionDto): Promise<CarSession> {
        const params: CarSessionPeriodDto = {
            startDate: data.startDate,
            endDate: data.endDate,
        };

        const isAvailable = this.checkCarAvailability(id, params);
          
        if (!isAvailable) {
            throw new BadRequestException(`car ${id} is not available for these dates`);
        }

        const price = await this.getCarPrice(id, params);
        const { startDate, endDate } = this.ejectAndValidateSessionPeriod(params);
        let session: CarSession = null;

        await this.knex.transaction(async trx => {
            const query = `
                INSERT INTO car_sessions (car_id, start_date, end_date, price)
                VALUES (?, ?, ?, ?)
                RETURNING *
            `;

            const data = [
                id,
                startDate,
                endDate,
                price,
            ];

            [session] = (await this.knex.raw(query, data).transacting(trx)).rows;
        });

        return session;
    }

    async getCarsUsageReport(year: number, month: number): Promise<CarsUsageReport[]> {
        if (month < 1 || month > 12) {
            throw new BadRequestException('invalid month');
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const daysInMonth = endDate.getDate();

        const query = `
            SELECT
                usage.car_id,
                COALESCE(cars.license_plate, 'Total') AS license_plate,
                usage.usage_percent
            FROM (
                SELECT
                    car_id,
                    ROUND(SUM(days_in_use)::DECIMAL / ? * 100, 2) AS usage_percent
                FROM (
                    SELECT
                        car_id,
                        (
                            CASE
                                WHEN end_date > ? THEN ?
                                ELSE end_date
                            END
                            -
                            CASE
                                WHEN start_date < ? THEN ?
                                ELSE start_date
                            END
                            + 1
                        ) AS days_in_use
                    FROM
                        car_sessions
                    WHERE
                        start_date >= ?
                        OR end_date <= ?
                ) t
                GROUP BY
                    ROLLUP(car_id)
            ) usage
            LEFT JOIN cars ON cars.id = usage.car_id
            ORDER BY
                usage.car_id
        `;

        const bindings = [
            daysInMonth,
            endDate, endDate,
            startDate, startDate,
            startDate,
            endDate,
        ];

        return (await this.knex.raw(query, bindings)).rows;
    }
}
