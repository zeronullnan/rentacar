import { ApiProperty } from '@nestjs/swagger';

export class CarSessionPeriodDto {
    startDate: string;
    endDate: string;
}

export class CreateCarSessionDto {
    @ApiProperty()
    startDate: string;
    
    @ApiProperty()
    endDate: string;
}

export class Car {
    id: number;
    license_plate: string;
    base_price: number;
    is_active: boolean;
}

export class CarSession {
    id?: number;
    car_id: number;
    start_date: string;
    end_date: string;
    price: number;
}

export class CarsUsageReport {
    car_id: number;
    license_plate: string;
    usage_percent: number;
}
