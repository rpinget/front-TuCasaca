# TuCasaca - Front

Front en React de **TuCasaca**, e-commerce de camisetas de fútbol.
Proyecto del Grupo 05 de Aplicaciones Interactivas (UADE).

El back (Spring Boot) está en otro repositorio: `back-TuCasaca`.

## Tecnologías

- React 19 + Vite
- React Router (navegación entre pantallas)
- Context API (sesión y carrito)
- CSS propio, responsive para celular, tablet y escritorio

## Cómo correrlo

Requisitos: Node.js instalado (`node -v` y `npm -v` tienen que responder).

```bash
npm install
npm run dev
```

Abrir http://localhost:5173/

Otros comandos:

```bash
npm run build     # genera la versión de producción en /dist
npm run preview   # sirve la versión de producción
npm run lint      # revisa el código con oxlint
```

### Con Docker (opcional)

```bash
docker compose up --build
```

Queda disponible en http://localhost:5173/

## Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Inicio: portada, listado de casacas, filtro por liga y buscador | Público |
| `/casacas/:id` | Detalle de una casaca y agregar al carrito | Público (comprar requiere sesión) |
| `/login` | Iniciar sesión | Público |
| `/registro` | Crear cuenta | Público |
| `/carrito` | Carrito de compras | Usuario logueado |
| `/checkout` | Confirmar compra | Usuario logueado |
| `/perfil` | Mis datos (`GET /api/usuarios/me`) | Usuario logueado |
| `/favoritos` | Casacas marcadas con el corazón | Público |
| `/admin` | Alta, edición y baja de casacas | Solo rol `ADMIN` |

## Estructura de carpetas

```
public/data/          Datos mock en JSON (ver más abajo)
src/
  main.jsx            Punto de entrada: Router y contextos
  App.jsx             Layout y definición de rutas
  index.css           Variables de diseño (colores, tipografías)
  context/
    AuthContext.jsx     Sesión del usuario (login, logout, rol)
    CarritoContext.jsx  Carrito de cada usuario
    FavoritosContext.jsx  Favoritos de cada usuario
    TemaContext.jsx     Modo claro / oscuro
  components/
    Navbar              Buscador, categorías por liga, menú de usuario, carrito
    Footer
    CasacaCard          Tarjeta de casaca del listado
    CamisetaImg         Foto de la casaca o camiseta dibujada si no hay foto
  pages/
    Home, Detalle, Login, Registro, Carrito, Checkout, Perfil, Favoritos, Admin, NotFound
```

## De dónde salen los datos (mock)

En esta etapa no se consume el back: los datos están en archivos JSON dentro de
`public/data` y se leen con `fetch` + `useEffect`. Cada archivo respeta la misma
forma que el JSON que devuelve el back, para que el cambio a la API real sea
cambiar solamente la URL.

| Archivo | Equivale a | DTO del back |
|---|---|---|
| `casacas.json` | `GET /api/casacas` | `CasacaDTO` (con `equipo` y `liga` anidados) |
| `ligas.json` | `GET /api/ligas` | `LigaDTO` |
| `equipos.json` | `GET /api/equipos` | `EquipoDTO` |
| `login.json` | respuesta de `POST /api/auth/login` | `LoginResponseDTO` |
| `usuario.json` | `GET /api/usuarios/me` | `UsuarioResponseDTO` |
| `carrito.json` | `GET /api/carritos/{usuarioId}` | `CarritoDTO` / `ItemCarritoDTO` |
| `usuarios-demo.json` | solo para simular el login | no existe en el back |

### Qué es simulado

Con el back levantado **no se simula nada**. Estos son los fallbacks cuando el back no responde:

- **Login:** se valida contra `usuarios-demo.json`. La sesión queda como "simulada" (`token: mock-token`).
- **Registro:** valida los campos y simula el alta.
- **Carrito:** en una sesión simulada se guarda en `localStorage`, un carrito por usuario.
- **Checkout y ABM de casacas (Admin):** en una sesión simulada solo actualizan la pantalla;
  los cambios se pierden al recargar porque los JSON de `public/data` son de solo lectura.

### Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@tucasaca.com | admin123 | ADMIN |
| ana.gomez@tucasaca.com | usuario123 | USUARIO |
| juan.perez@tucasaca.com | usuario123 | USUARIO |

## Conexión con el back

Toda la comunicación está en `src/services/api.js` (URL `http://localhost:8080`, o `VITE_API_URL`).
Las pantallas usan `fetch` + `useEffect` / handlers `async` y muestran el `message` de error del back.

| Pantalla | Endpoints |
|---|---|
| Inicio, Navbar | `GET /api/casacas`, `GET /api/casacas/liga/{id}`, `GET /api/ligas` |
| Detalle | `GET /api/casacas/{id}` |
| Login | `POST /api/auth/login` |
| Registro | `POST /api/usuarios/registro` |
| Perfil | `GET /api/usuarios/me` |
| Carrito | `GET /api/carritos/{usuarioId}`, `POST .../items`, `DELETE .../items/{itemId}`, `DELETE .../vaciar` |
| Checkout | `POST /api/carritos/{usuarioId}/checkout` |
| Admin | `GET /api/equipos`, `POST /api/casacas`, `PUT /api/casacas/{id}`, `DELETE /api/casacas/{id}` |

- **Back levantado:** se usan los endpoints reales. En el back, el origen `http://localhost:5173` ya está permitido por CORS.
- **Back apagado:** el front sigue funcionando con los JSON de `public/data` (misma forma que los DTOs).
- **Forzar datos locales:** crear un archivo `.env` con `VITE_USE_MOCK=true`.

## Extras

- Ordenamiento del catálogo por precio o año (selector en el Inicio).
- **Favoritos:** corazón en cada casaca y página `/favoritos` (se guardan en `localStorage`, por usuario).
- **Modo oscuro:** botón ☾/☀ en el Navbar. Recuerda la elección y respeta la preferencia del sistema.
