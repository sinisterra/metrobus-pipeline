import pymongo
import requests
import fire
from pymongo import MongoClient, GEOSPHERE, TEXT


def metrobus(uri=None, dbname=None):
    print("Hello, world!")

    client = MongoClient(uri, retryWrites=False)
    db = client[dbname]

    db.events.create_index([("unit._id", TEXT)])
    db.events.create_index([("location.geometry", GEOSPHERE)])

    # EXTRACTION

    # first fetch 0 rows to get the
    metrobus_meta_records = requests.get(
        "https://datos.cdmx.gob.mx/api/records/1.0/search/?dataset=prueba_fetchdata_metrobus&rows=0"
    ).json()

    total_records = metrobus_meta_records["nhits"]

    data = requests.get(
        f"https://datos.cdmx.gob.mx/api/records/1.0/search/?dataset=prueba_fetchdata_metrobus&rows={total_records}"
    ).json()

    print(f"{total_records} were found")

    records = data["records"]

    events = []
    # TRANSFORM
    for (i, record) in enumerate(records):
        # use this location for reverse geocoding
        event_location = record["geometry"]

        event_alcaldia = db.alcaldias.find_one(
            {"loc": {"$geoIntersects": {"$geometry": event_location}}},
            {"_id": True, "name": True},
        )

        event = {
            "_id": record["recordid"],
            "unit": {"_id": record["fields"]["vehicle_id"]},
            "location": {"geometry": event_location, "alcaldia": event_alcaldia},
            "timestamp": record["record_timestamp"],
        }

        events.append(event)

    try:
        db.events.insert_many(events)
        print("Extraction finished")
    except Exception as ex:
        print(ex)


if __name__ == "__main__":
    fire.Fire(metrobus)
