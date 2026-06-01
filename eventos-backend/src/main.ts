import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: FRONTEND_URL,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Excluye campos marcados con @Exclude() en las respuestas
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Filtro global de excepciones para respuesta consistente
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger (OpenAPI) - solo en entornos de desarrollo
  try {
    const config = new DocumentBuilder()
      .setTitle('Eventos API')
      .setDescription('API para la plataforma de gestión de eventos')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  } catch (err) {
    // Si falla Swagger (por ejemplo falta dependencia), no interrumpir arranque
    console.warn('Swagger no disponible:', err?.message || err);
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log('Servidor corriendo en http://localhost:3000');
}
bootstrap();