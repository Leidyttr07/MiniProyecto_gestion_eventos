<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Ejecutar pruebas unitarias rápidas (selectivas)

Para ejecutar sólo las pruebas unitarias que hemos añadido o modificado, puedes ejecutar:

```bash
npx jest src/registrations/registrations.unit.spec.ts src/events/events.service.spec.ts src/auth/auth.service.spec.ts --runInBand
```

Esto es útil durante desarrollo para validar cambios sin correr toda la suite.

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

## Proyecto: Plataforma de Gestión de Eventos (local)

Este repositorio contiene el backend del mini-proyecto de la asignatura. A continuación se agregan instrucciones específicas para correrlo localmente y resolver conflictos comunes.

### Variables de entorno (usar `.env` o definir en el entorno)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=eventos_db

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600s

PORT=3000
```

### Ejecutar en desarrollo

```bash
cd eventos-backend
npm install
npm run start:dev
```

### Documento OpenAPI (Swagger)

Si `@nestjs/swagger` y `swagger-ui-express` están instalados, la documentación estará disponible en `http://localhost:3000/api`.

### Conflicto de puerto (Windows)

Si al iniciar aparece `EADDRINUSE: address already in use :::3000`, hay un proceso ocupando el puerto. Para identificarlo y finalizarlo:

1. Buscar el PID que usa el puerto 3000:

```powershell
netstat -ano | findstr :3000
```

2. Ver el proceso por PID:

```powershell
tasklist /FI "PID eq <PID>"
```

3. Finalizar el proceso (si corresponde):

```powershell
taskkill /PID <PID> /F
```

Alternativa rápida: iniciar la app en otro puerto:

```powershell
#$env:PORT=3001; npm run start:dev
```

Si quieres, puedo ayudarte a crear un script para levantar el backend en un puerto alternativo automáticamente.

### Refresh tokens

Este backend emite `refresh_token` en el endpoint de login. Endpoints disponibles:

- `POST /auth/refresh` — cuerpo `{ "refresh_token": "<token>" }` — devuelve `{ "access_token": "..." }`.
- `POST /auth/logout` — cuerpo `{ "refresh_token": "<token>" }` — invalida el `refresh_token` en la base de datos.

Notas:
- En esta implementación los `refresh_token` se almacenan en la tabla `users` en la columna `refresh_token` de forma hashed.
- Para renovar el `access_token` desde el frontend, enviar el `refresh_token` al endpoint `/auth/refresh` y actualizar el `access_token` local.
