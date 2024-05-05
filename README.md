# e-shop-collector

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Github Test Status](https://github.com/WildEgor/e-shop-collector/actions/workflows/testing.yml/badge.svg)](https://github.com/WildEgor/e-shop-nodepack/actions/workflows/testing.yml/badge.svg)
[![codecov](https://codecov.io/gh/WildEgor/e-shop-nestjs-collector/branch/main/graph/badge.svg)](https://codecov.io/gh/WildEgor/e-shop-nestjs-microservice-boilerplate)

eShopCollector - service for bulk insertion to Clickhouse

## Usage

Add own sql scripts (if want create tables) to 'scripts'

Run application
```sh
yarn start:dev
```

Send data to `collector` queue this payload. For example:

```json
{
  "pattern": "topic_feedbacks",
  "data": {
    "id": "11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000",
    "t_id": 123,
    "s_tid": 1,
    "s_tun": "test",
    "s_uid": "2",
    "u_tid": 3,
    "u_tun": "test2",
    "rating": 5
  }
}
```

```json
{
  "pattern": "taxi_trips",
  "data": {
    "trip_id": "123456789",
    "pickup_datetime": "2023-12-08T12:30:00Z",
    "dropoff_datetime": "2023-12-08T13:00:00Z",
    "pickup_longitude": -73.987456,
    "pickup_latitude": 40.748817,
    "dropoff_longitude": -74.006789,
    "dropoff_latitude": 40.712345,
    "passenger_count": 3,
    "trip_distance": 5.25,
    "fare_amount": 15.5,
    "extra": 1.5,
    "tip_amount": 3,
    "tolls_amount": 2.25,
    "total_amount": 22.25,
    "payment_type": 1,
    "pickup_ntaname": "Midtown",
    "dropoff_ntaname": "Downtown"
  }
}
