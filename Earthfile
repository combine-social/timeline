VERSION 0.7

#
# turbo prune target
#
# prune target creates a build artifact containing just pruned apps and dependent packages.
#
prune:
  ARG image='node:19'
  ARG app
  FROM $image
  WORKDIR /app
  COPY ./package*.json ./
  COPY ./turbo.json ./
  COPY ./apps/$app/ ./apps/$app/
  COPY ./packages/ ./packages/
  RUN npm install
  RUN npx turbo prune --scope=$app --docker
  SAVE ARTIFACT out/full /$app/out/full

#
# npm run build target
#
# build-image target creates a root-context image
# BUILD_APP command performs build steps
# build target creates a build artifact with the default build image
#
build-image:
  ARG image='node:19'
  ARG app
  FROM $image
  WORKDIR /app
  COPY +prune/$app/out/full .
  COPY ./package*.json ./
  COPY ./turbo.json ./

BUILD_APP:
  COMMAND
  ARG app
  RUN npm install
  RUN npm audit --omit=dev
  # RUN npm run lint
  RUN npm run build
  RUN mkdir -p out/dist && \
    tar cf dist.tar `find packages apps -name package.json -or -name dist` && \
    cd out/dist && \
    tar xf ../../dist.tar
  SAVE ARTIFACT out/dist /$app/out/dist

build:
  ARG app
  FROM +build-image --app=$app
  DO +BUILD_APP --app=$app

#
# npm install --omit=dev target
#
# final-image target creates a root-context image
# FINALIZE_APP command performs final npm install
# final target creates a build artifact with the default final image
#
final-image:
  ARG image='node:19-slim'
  FROM $image
  WORKDIR /app
  COPY ./package*.json ./

FINALIZE_APP:
  COMMAND
  ARG target='+build'
  ARG app
  COPY $target/$app/out/dist .
  RUN npm install --omit=dev

final:
  ARG app
  FROM +final-image
  DO +FINALIZE_APP --app=$app
