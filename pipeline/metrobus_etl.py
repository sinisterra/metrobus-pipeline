from kfp import dsl


def provision(mongodb_uri="", dbname=""):
    return dsl.ContainerOp(
        name="get_metrobus_data",
        image="sinisterra/metrobus_etl:extract",
        command=["python"],
        arguments=[
            "provision.py",
            "alcaldias",
            f"--uri={mongodb_uri}",
            f"--dbname={dbname}",
        ],
    )


def get_metrobus_data(mongodb_uri="", dbname=""):
    return dsl.ContainerOp(
        name="get_metrobus_data",
        image="sinisterra/metrobus_etl:extract",
        command=["python"],
        arguments=["etl.py", f"--uri={mongodb_uri}", f"--dbname={dbname}"],
    )


@dsl.pipeline(name="Metrobus ETL")
def metrobus_etl(mongodb_uri="", dbname=""):

    provision_stage = provision(mongodb_uri=mongodb_uri, dbname=dbname)

    get_metrobus_data(mongodb_uri=mongodb_uri, dbname=dbname).after(provision_stage)


if __name__ == "__main__":
    import kfp.compiler as compiler

    compiler.Compiler().compile(metrobus_etl, __file__ + ".tar.gz")
    print("Pipeline compiled successfully")
