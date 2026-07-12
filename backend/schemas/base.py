from typing import Any, Dict
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict, model_validator
from pydantic_core import core_schema

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            )
        )

    @classmethod
    def validate(cls, value):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")
        return str(value)

class MongoBaseModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId)

    @model_validator(mode="before")
    @classmethod
    def convert_mongo_id(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "_id" in data:
                # Store _id as id
                data["id"] = str(data["_id"])
        return data

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
class MongoBaseModelWithoutId(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
