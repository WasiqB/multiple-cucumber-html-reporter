import { After, Before, type DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { type BookingPayload, RestfulBookerApi } from '../api/restful-booker.api.js';

let api: RestfulBookerApi;
let authToken: string;
let bookingId: number;
let currentBookingPayload: BookingPayload;
let updatedBookingPayload: BookingPayload;
let retrievedBooking: BookingPayload;
let listContainsId = false;
let deleteStatus = false;
let getErrorStatus = false;

Before({ tags: '@api' }, async () => {
  api = new RestfulBookerApi();
  await api.init();
});

After({ tags: '@api' }, async () => {
  if (api) {
    await api.dispose();
  }
});

Given('I initialize the Restful Booker API client', async () => {
  expect(api).toBeDefined();
});

When('I authenticate with username {string} and password {string}', async (username: string, password: string) => {
  authToken = await api.authenticate(username, password);
});

Then('I should receive a valid auth token', async () => {
  expect(authToken).toBeDefined();
  expect(typeof authToken).toBe('string');
  expect(authToken.length).toBeGreaterThan(0);
});

When('I create a booking with the following details:', async function (dataTable: DataTable) {
  const row = dataTable.hashes()[0] as Record<string, string>;
  currentBookingPayload = {
    firstname: row.firstname,
    lastname: row.lastname,
    totalprice: Number.parseInt(row.totalprice, 10),
    depositpaid: row.depositpaid === 'true',
    bookingdates: {
      checkin: row.checkin,
      checkout: row.checkout,
    },
    additionalneeds: row.additionalneeds,
  };

  const response = await api.createBooking(currentBookingPayload);
  this.attach(JSON.stringify(response), 'application/json');

  bookingId = response.bookingid;
  retrievedBooking = response.booking;
});

Then('the booking should be created successfully', async () => {
  expect(bookingId).toBeDefined();
  expect(bookingId).toBeGreaterThan(0);
});

Then('the created booking details should match the payload', async () => {
  expect(retrievedBooking.firstname).toBe(currentBookingPayload.firstname);
  expect(retrievedBooking.lastname).toBe(currentBookingPayload.lastname);
  expect(retrievedBooking.totalprice).toBe(currentBookingPayload.totalprice);
  expect(retrievedBooking.depositpaid).toBe(currentBookingPayload.depositpaid);
  expect(retrievedBooking.bookingdates.checkin).toBe(currentBookingPayload.bookingdates.checkin);
  expect(retrievedBooking.bookingdates.checkout).toBe(currentBookingPayload.bookingdates.checkout);
  expect(retrievedBooking.additionalneeds).toBe(currentBookingPayload.additionalneeds);
});

Then('I should store the new booking ID', async () => {
  expect(bookingId).toBeGreaterThan(0);
});

When('I retrieve the list of all bookings', async () => {
  const bookings = await api.getBookingIds();
  listContainsId = bookings.some((b) => b.bookingid === bookingId);
});

Then('the list should contain the newly created booking ID', async () => {
  expect(listContainsId).toBe(true);
});

When('I retrieve the booking details by the stored ID', async () => {
  retrievedBooking = await api.getBooking(bookingId);
});

Then('the retrieved booking details should match the creation payload', async () => {
  expect(retrievedBooking.firstname).toBe(currentBookingPayload.firstname);
  expect(retrievedBooking.lastname).toBe(currentBookingPayload.lastname);
  expect(retrievedBooking.totalprice).toBe(currentBookingPayload.totalprice);
  expect(retrievedBooking.depositpaid).toBe(currentBookingPayload.depositpaid);
  expect(retrievedBooking.bookingdates.checkin).toBe(currentBookingPayload.bookingdates.checkin);
  expect(retrievedBooking.bookingdates.checkout).toBe(currentBookingPayload.bookingdates.checkout);
  expect(retrievedBooking.additionalneeds).toBe(currentBookingPayload.additionalneeds);
});

When('I update the booking details to:', async function (dataTable: DataTable) {
  const row = dataTable.hashes()[0] as Record<string, string>;
  updatedBookingPayload = {
    firstname: row.firstname,
    lastname: row.lastname,
    totalprice: Number.parseInt(row.totalprice, 10),
    depositpaid: row.depositpaid === 'true',
    bookingdates: {
      checkin: row.checkin,
      checkout: row.checkout,
    },
    additionalneeds: row.additionalneeds,
  };

  retrievedBooking = await api.updateBooking(bookingId, authToken, updatedBookingPayload);
  this.attach(JSON.stringify(retrievedBooking), 'application/json');
});

Then('the booking should be updated successfully', async () => {
  expect(retrievedBooking).toBeDefined();
});

Then('the updated booking details should match the new payload', async () => {
  expect(retrievedBooking.firstname).toBe(updatedBookingPayload.firstname);
  expect(retrievedBooking.lastname).toBe(updatedBookingPayload.lastname);
  expect(retrievedBooking.totalprice).toBe(updatedBookingPayload.totalprice);
  expect(retrievedBooking.depositpaid).toBe(updatedBookingPayload.depositpaid);
  expect(retrievedBooking.bookingdates.checkin).toBe(updatedBookingPayload.bookingdates.checkin);
  expect(retrievedBooking.bookingdates.checkout).toBe(updatedBookingPayload.bookingdates.checkout);
  expect(retrievedBooking.additionalneeds).toBe(updatedBookingPayload.additionalneeds);
});

When('I retrieve the booking details by the stored ID again', async () => {
  retrievedBooking = await api.getBooking(bookingId);
});

Then('the retrieved booking details should match the updated payload', async () => {
  expect(retrievedBooking.firstname).toBe(updatedBookingPayload.firstname);
  expect(retrievedBooking.lastname).toBe(updatedBookingPayload.lastname);
  expect(retrievedBooking.totalprice).toBe(updatedBookingPayload.totalprice);
  expect(retrievedBooking.depositpaid).toBe(updatedBookingPayload.depositpaid);
  expect(retrievedBooking.bookingdates.checkin).toBe(updatedBookingPayload.bookingdates.checkin);
  expect(retrievedBooking.bookingdates.checkout).toBe(updatedBookingPayload.bookingdates.checkout);
  expect(retrievedBooking.additionalneeds).toBe(updatedBookingPayload.additionalneeds);
});

When('I delete the booking by the stored ID', async () => {
  await api.deleteBooking(bookingId, authToken);
  deleteStatus = true;
});

Then('the booking should be deleted successfully', async () => {
  expect(deleteStatus).toBe(true);
});

When('I attempt to retrieve the booking details by the stored ID', async () => {
  getErrorStatus = false;
  try {
    await api.getBooking(bookingId);
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('status 404')) {
      getErrorStatus = true;
    }
  }
});

Then('the booking should not be found', async () => {
  expect(getErrorStatus).toBe(true);
});
