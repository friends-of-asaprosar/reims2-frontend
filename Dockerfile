FROM node:20.15.1@sha256:6326b52a508f0d99ffdbfaa29a69380321b215153db6f32974835bac71b38fa4 AS build

WORKDIR /usr/src/app
COPY .yarn/ .yarn/
COPY public/ public/
COPY src/ src/
COPY .yarnrc.yml .pnp.* index.html package.json yarn.lock tsconfig.json tsconfig.node.json vite.config.ts .browserslistrc ./

RUN yarn install --immutable

ARG GIT_VERSION=unknown
ENV VITE_GIT_VERSION=${GIT_VERSION}
RUN yarn build

# PROD IMAGE
FROM caddy:2.8.4-alpine@sha256:896c6fb9e3eae11890f53dc528b8a9be1b4d058f6b7603024feb084fc203c0b4

COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=build /usr/src/app/dist /usr/share/caddy

EXPOSE 5000
HEALTHCHECK --interval=5s --timeout=5s --retries=3 --start-period=15s CMD wget -nv -t1 --spider 'http://localhost:5000' || exit 1

