import { type APIRequestContext, request } from '@playwright/test';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface BookingResponse {
  bookingid: number;
  booking: BookingPayload;
}

export class RestfulBookerApi {
  private requestContext!: APIRequestContext;
  private readonly baseUrl = 'https://restful-booker.herokuapp.com';

  public async init() {
    this.requestContext = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  public async authenticate(username = 'admin', password = 'password123'): Promise<string> {
    const response = await this.requestContext.post('/auth', {
      data: { username, password },
    });
    if (!response.ok()) {
      throw new Error(`Authentication failed with status ${response.status()}: ${await response.text()}`);
    }
    const body = (await response.json()) as { token: string };
    return body.token;
  }

  public async getBookingIds(): Promise<{ bookingid: number }[]> {
    const response = await this.requestContext.get('/booking');
    if (!response.ok()) {
      throw new Error(`Failed to get booking IDs with status ${response.status()}`);
    }
    return response.json() as Promise<{ bookingid: number }[]>;
  }

  public async getBooking(id: number): Promise<BookingPayload> {
    const response = await this.requestContext.get(`/booking/${id}`);
    if (response.status() === 404) {
      throw new Error(`Booking ${id} not found`);
    }
    if (!response.ok()) {
      throw new Error(`Failed to get booking ${id} with status ${response.status()}`);
    }
    return response.json() as Promise<BookingPayload>;
  }

  public async createBooking(payload: BookingPayload): Promise<BookingResponse> {
    const response = await this.requestContext.post('/booking', {
      data: payload,
    });
    if (!response.ok()) {
      throw new Error(`Failed to create booking with status ${response.status()}`);
    }
    return response.json() as Promise<BookingResponse>;
  }

  public async updateBooking(id: number, token: string, payload: BookingPayload): Promise<BookingPayload> {
    const response = await this.requestContext.put(`/booking/${id}`, {
      headers: {
        Cookie: `token=${token}`,
      },
      data: payload,
    });
    if (!response.ok()) {
      throw new Error(`Failed to update booking ${id} with status ${response.status()}`);
    }
    return response.json() as Promise<BookingPayload>;
  }

  public async deleteBooking(id: number, token: string): Promise<void> {
    const response = await this.requestContext.delete(`/booking/${id}`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    if (!response.ok()) {
      throw new Error(`Failed to delete booking ${id} with status ${response.status()}`);
    }
  }

  public async dispose() {
    if (this.requestContext) {
      await this.requestContext.dispose();
    }
  }
}
