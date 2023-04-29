/* eslint-disable @typescript-eslint/no-var-requires */
const {SlonikMigrator} = require('@slonik/migrator')
const {createPool} = require('slonik')
const path = require('path')

// in an existing slonik project, this would usually be setup in another module
const slonik = createPool(process.env.POSTGRES_CONNECTION_STRING) // e.g. 'postgresql://postgres:postgres@localhost:5433/postgres'

const migrator = new SlonikMigrator({
  migrationsPath: path.resolve(__dirname + '/../migrations'),
  migrationTableName: 'migration',
  slonik,
})

migrator.runAsCLI()