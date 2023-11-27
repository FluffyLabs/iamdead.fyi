// @generated automatically by Diesel CLI.

diesel::table! {
    users (id) {
        id -> Integer,
        username -> Text,
        auth_provider -> Text,
        auth_provider_id -> Text,
    }
}
