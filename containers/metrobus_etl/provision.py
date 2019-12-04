import fire
import sys
import requests
from pymongo import MongoClient, GEOSPHERE
from pymongo.errors import BulkWriteError

# scrape the polygons from Datos Abiertos


def transform_record(record):
    alcaldia_record = record["fields"]

    # Transform
    alcaldia = {
        "_id": alcaldia_record["cvegeo"],
        "name": alcaldia_record["nomgeo"],
        "loc": alcaldia_record["geo_shape"],
    }

    return alcaldia


class Provision(object):
    def alcaldias(self, uri=None, dbname=""):
        # make sure a uri and dbname is provided
        if (uri is None or uri == "") and dbname is not None:
            print("Both uri and dbname are required.")
            sys.exit(1)

        # connect to MongoDB instance
        client = MongoClient(uri, retryWrites=False)
        db = client[dbname]

        # Create an index with the GeoJSON polygons
        db.alcaldias.create_index([("loc", GEOSPHERE)])

        # Begin ETL Process:

        # Extract the response
        data = requests.get(
            "https://datos.cdmx.gob.mx/api/records/1.0/search/?dataset=alcaldias&rows=16"
        ).json()

        # Transform the response, keeping only the relevant fields
        alcaldias = list(map(transform_record, data["records"]))

        # Load it to the database
        try:
            db.alcaldias.insert_many(alcaldias, ordered=False)
        except BulkWriteError:
            print("An error happened while attempting to insert alcaldias")

        print("Alcaldias provisioning finished")

        sys.exit(0)


# load them to my database
if __name__ == "__main__":
    fire.Fire(Provision)
