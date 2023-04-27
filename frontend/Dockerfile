FROM node:20 AS builder

# deps
WORKDIR /frontend
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn --frozen-lockfile

# build
COPY . .
RUN yarn build

FROM nginx:1.23.4
COPY --from=builder /frontend/build/ /usr/share/nginx/html/
