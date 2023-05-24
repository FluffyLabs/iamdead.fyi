use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use crate::schema::users;


#[derive(Debug, Queryable, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: i32,
    pub username: String,
    pub auth_provider: String,
    pub auth_provider_id: String,
}

#[derive(Debug, Insertable, Deserialize)]
#[diesel(table_name = users)]
#[serde(rename_all = "camelCase")]
pub struct NewUser {
    pub username: String,
    pub auth_provider: String,
    pub auth_provider_id: String,
}

