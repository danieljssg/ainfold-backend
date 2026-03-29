# ⚙️ Spotz Analysis: Backend Orchestration

## _Motor de Análisis IA y Síntesis de Voz_

AI'nFold Backend es el núcleo de procesamiento y la extracción de datos, el análisis de LLMs y la generación de audio mediante modelos de síntesis de voz (TTS) autohospedados.

---

## 🏗️ Arquitectura de Servicios

El backend está diseñado bajo una premisa simple: **ningún proceso monolítico**. Cada tarea tiene su propio worker y ""nada"" bloquea el event loop principal.

### 🔁 El Corazón de las Colas: BullMQ + Valkey

En lugar de Redis, uso **Valkey**, el fork open source. Es 100% compatible con BullMQ y garantiza una arquitectura libre de restricciones de licenciamiento. Centralizar la lógica en colas permite que la API responda instantáneamente mientras el procesamiento pesado sucede en segundo plano.

- **`analysisStream`:** Gestiona el procesamiento de CVs. Extrae texto (PDF Service con Unpdf) y llama a la IA (AI Service con OpenRouter). Concurrencia: 3 simultáneos para balancear velocidad y carga.
- **`audioStream`:** Pasa el `ai_insight` por el modelo Kokoro-TTS. Concurrencia forzada a **1 ejecucion simultánea** para proteger la estabilidad de la CPU/RAM en la instancia GP.Micro, evitando que el proceso de síntesis agote los recursos.
- **`mainStream`:** Maneja tareas de soporte como logs de auditoría y actualizaciones de metadatos de usuario.

---

## 🛡️ Seguridad y Resiliencia

### 🌐 Configuración de CORS y Rate Limitting
Dado que operamos en una instancia **GP.Micro**, la protección de recursos es vital:
- **CORS (`src/config/corsConfig.js`):** Configurado estrictamente para permitir solo orígenes autorizados con `credentials: true`. Esto es crucial para la seguridad de las sesiones basadas en cookies y evitar ataques CSRF.
- **Rate Limiter (`src/config/limitter.js`):** Implementamos dos niveles:
  - **Global:** 100 peticiones cada 5 min para evitar abuso general.
  - **Análisis:** Limitado a 5 peticiones cada 5 min. Esto previene que un solo usuario sature el motor de IA y el crédito de OpenRouter, además de proteger la CPU de picos de extracción de texto simultáneos.

---


## 🧠 Lógica de Negocio e IA

- **IA Service (OpenRouter):** Construye prompts dinámicos inyectando el CV, el nombre y el hobby del candidato. Rota automáticamente API Keys para asegurar mayor disponibilidad.
- **TTS Service (Kokoro):** Motor de síntesis de voz autohospedado en la propia instancia. Los textos pasan por un diccionario fonético (`ttsDictionary.js`) que traduce anglicismos y tecnicismos al español para una pronunciación perfecta, por ejemplo "AI" se pronuncia "Ei Ai" y no "Ai".
- **PDF Service:** Extracción de texto mediante `unpdf` con validación de integridad para detectar archivos corruptos o ilegibles. (como documentos escaneados o con imágenes)

---

## 📂 Estructura del Backend (Folder-by-Folder)

- **`src/api/`**: Contiene la definición de rutas y controladores. Es la puerta de entrada para todas las peticiones del frontend.
- **`src/config/`**: El cerebro de la configuración. Aquí reside la lógica de CORS, Rate Limitting, conexión a DB, Redis, y estrategias de JWT/OAuth.
- **`src/jobs/`**: El motor de procesamiento asíncrono.
  - **`queues/`**: Definición técnica de las colas de BullMQ.
  - **`workers/`**: La lógica real que procesa cada tarea (Análisis, TTS, Logs). Cada worker corre de forma aislada.
- **`src/modules/`**: Lógica de negocio segmentada por dominio (Auth, Usuarios, Análisis). Cada módulo orquestra sus propios controladores y servicios específicos.
- **`src/shared/`**: Recursos que atraviesan todo el sistema.
  - **`models/`**: Definición de esquemas de Mongoose.
  - **`services/`**: Abstracciones para interactuar con IA, TTS y envío de correos.
  - **`prompts/`**: Plantillas dinámicas de IA para asegurar resultados consistentes.
- **`src/utils/`**: Helpers utilitarios como el builder de prompts y el extractor de texto de PDFs.

---

## 🗄️ Modelos de Datos (MongoDB)

- **`User`**: Gestiona la identidad, perfiles de Google y roles (Demo/Admin).
- **`Analysis`**: El "core" del dato. Almacena la extracción de texto, el análisis JSON generado por la IA y referencias al audio.
- **`AnalysisAudio`**: Rastrea los archivos de voz generados, su ubicación en el volumen compartido y metadatos de generación.
- **`Job`**: Mapea el estado de las colas de BullMQ a la base de datos para permitir al frontend hacer polling del progreso en tiempo real.
- **`AuditLog`**: Registro de acciones críticas para trazabilidad y debugging.
- **`File`**: Gestión de metadatos de los CVs subidos.

---

## 🏗️ Infraestructura Cubepath (GP.Micro)

Esta es la pieza clave: **Todo el ecosistema convive en una sola instancia de 2 vCPU / 4 GB RAM.** Orquestado con **Dokploy**.

- **Optimización de Recursos:** La instancia cuenta con 4 GB de SWAP activo para absorber picos de carga durante la ejecución del modelo TTS.
- **Comunicación Interna:** Los servicios se conectan usando IDs internos de Dokploy, evitando tráfico por red pública y reduciendo la latencia al mínimo.
- **Persistencia Compartida:** Se utiliza un directorio bindeado en la VM para que la API, el Worker y el Frontend puedan acceder a los archivos `.mp3` generados sin transferencias innecesarias.
- **Seguridad Epímera:** Todos los registros (análisis, jobs, audios) tienen un **TTL de 1 hora** en MongoDB. Al ser una demo, la prioridad es la privacidad y la limpieza automática de datos.

---

## 🛠️ Instalación y Configuración

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/danieljssg/ainfold-backend
    ```
2.  **Instala las dependencias:**
    ```bash
    pnpm install
    ```
3.  **Configura las variables de entorno:**
    Copia el archivo de ejemplo y rellena los valores necesarios (puedes ver todos los nombres requeridos en `env.example`):
    ```bash
    cp env.example .env
    ```
4.  **Ejecución del Sistema:**
    El backend se divide en dos procesos independientes que deben correr simultáneamente:

    - **Para la API (Servidor Express):**
      - Desarrollo: `pnpm run dev`
      - Producción: `pnpm run start`
    - **Para el Worker (Procesamiento de Colas):**
      - Desarrollo: `pnpm run dev:worker`
      - Producción: `pnpm run start:worker`

---

> Desarrollado desde **Venezuela** por Daniel Saud. Porque contar historias que se escriben con código también es una forma de arte. 🇻🇪
