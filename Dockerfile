FROM rust:latest AS chef
# We only pay the installation cost once,
# it will be cached from the second build onwards
RUN cargo install cargo-chef

WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
WORKDIR /app

# Update image with alpine-target tools
RUN update-ca-certificates

COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json

# Build application
COPY . .

RUN cargo build --release

# We do not need the Rust toolchain to run the binary!
FROM gcr.io/distroless/cc-debian11

ENV SERVER_URL 0.0.0.0:8080

COPY --from=builder /app/target/release/icod-* /usr/local/bin/

EXPOSE 8080

CMD ["/usr/local/bin/icod-backend"]
