# 10. Ajustes y base de datos

Los **Ajustes** se abren desde la barra lateral o desde el menú de la asociación, arriba a la derecha. Hay siete pestañas: **Perfil de la Asociación**, **Finanzas**, **General**, **Registro**, **Firmas**, **Base de Datos** y **Registro de actividad**.

## 10.1 Perfil de la Asociación

Para cambiar los datos pulsa **Editar Perfil** y, cuando termines, **Guardar Cambios**.
- **Identidad**: Nombre de la Asociación, Tipo, Código Fiscal, Número de IVA, Fecha de fundación.
- **Contactos**: Correo, Teléfono, Dirección, Ciudad, Provincia, Código postal.
- **Organigrama**: Presidente, Vicepresidente, Secretario, Tesorero. Estos nombres aparecen en los documentos oficiales: balance anual y firmantes de los certificados.
- **Documentos**: Ruta/Enlace estatuto y Ruta/Enlace reglamento.
- **Logotipo de la Asociación**: pulsa **Subir Nuevo** y elige un PNG o JPG. Se recomienda 500×500 px.
- **Configuración**: Formato de Número de Socio (`YYYY` para el año, `####` para el número correlativo) y Cuota base de membresía.

> El formato de carné y la cuota base se guardan, pero el formulario de socio todavía no los aplica automáticamente (consulta el capítulo 2).

## 10.2 Finanzas

Aquí gestionas los **Métodos de Pago** con **Añadir Método**:
- **Nombre del Método**;
- **Tipo**: Efectivo, Transferencia Bancaria, Pago en Línea, Otro;
- **Activo**, es decir, si el método está disponible en las transacciones;
- **Aplicar Comisión**, con **Comisión Fija (€)** y/o **Comisión Porcentual (%)**.

Cada método se puede editar o eliminar.

## 10.3 General

- **Idioma**: italiano, inglés, español, alemán, francés.
- **Tema**: Claro u Oscuro. La elección se aplica tras **Guardar Preferencias**. El botón sol/luna de la barra superior cambia el tema al instante.
- **Zoom de interfaz**: 50 %, 75 %, 100 %, 125 %, 150 %, 175 % o 200 %. Se aplica de inmediato y se recuerda.
- **Gestión de Datos**: **Hacer Copia de Seguridad Ahora** (consulta 10.6).
- **Info de la App**: versión, licencia, advertencias, **Informar de un error** (abre un correo ya redactado con la versión) y el recuadro **Apoya AssociaGo** con **Apoyar con una donación**.

## 10.4 Registro, Firmas y Registro de actividad

- **Registro**: sedes, documentos y vencimientos de la asociación (consulta el capítulo 18).
- **Firmas**: las firmas institucionales (consulta el capítulo 16).
- **Registro de actividad**: la lista de creaciones, modificaciones y eliminaciones de datos, con filtros por área, acción y fechas (consulta el capítulo 18).

## 10.5 Base de datos

AssociaGo puede trabajar con dos tipos de base de datos:

| | **SQLite local** (predeterminada) | **MariaDB remota** |
|---|---|---|
| Dónde están los datos | En un archivo del equipo | En un servidor MariaDB de tu organización |
| Uso típico | Un solo puesto | Varios puestos con los mismos datos |
| Configuración | Ninguna | Host, puerto, base de datos, usuario, contraseña |

El recuadro superior indica la base de datos en uso: **Activo: SQLite local** o **Activo: MariaDB**.

### Conectar una base de datos MariaDB
1. Pide al administrador una **base de datos vacía y dedicada** y un usuario con permisos de lectura, escritura y creación de tablas.
2. Haz una copia de seguridad (consulta 10.6).
3. Activa **Usar Base de Datos Remota** y rellena **Host**, **Puerto** (normalmente 3306), **Nombre Base de Datos**, **Usuario** y **Contraseña**.
4. Si el servidor lo requiere, activa **Usar Conexión SSL**. AssociaGo verifica el certificado del servidor.
5. Pulsa **Probar conexión**. AssociaGo abre la conexión e intenta escribir y volver a leer un dato temporal. Si todo va bien aparece "Conexión verificada: lectura y escritura correctas."
6. Pulsa **Guardar Configuración de Base de Datos**. Al guardar se repite la verificación: si las credenciales son incorrectas, la configuración no se guarda.
7. **Cierra y vuelve a abrir AssociaGo.** La nueva conexión solo se activa al volver a abrirlo.

La primera vez que se abre sobre una base de datos vacía, AssociaGo crea las tablas y muestra el formulario de primer inicio (capítulo 1) para crear la asociación en el servidor.

### Lo que debes saber
- **Los datos no se transfieren.** SQLite local y MariaDB siguen siendo dos archivos separados. Para llevar los socios de uno a otro usa la exportación e importación CSV/JSON (capítulo 2).
- Para volver a SQLite desactiva **Usar Base de Datos Remota**, guarda y vuelve a abrir la app. Los datos locales siguen ahí.
- La contraseña de la base de datos nunca se vuelve a mostrar. Si dejas el campo vacío y no cambias host, usuario ni base de datos, sigue siendo válida la guardada.
- Los errores de conexión no muestran direcciones internas ni credenciales.

## 10.6 Copia de seguridad

**Hacer Copia de Seguridad Ahora** (Ajustes › General) guarda una copia de la base de datos en la carpeta `backups` de los datos de AssociaGo (`~/.associago/backups` por defecto). Al terminar aparece la ruta del archivo.

- **SQLite**: una copia coherente de la base de datos (`.db`), creada incluso mientras la app está en uso.
- **MariaDB**: una instantánea en formato JSON (`.json`) de todas las tablas.

La copia incluye solo la base de datos: los logotipos y los archivos externos no se incluyen.

> La restauración no es automática. Para SQLite, con la app cerrada, sustituye el archivo de la base de datos por la copia. La instantánea JSON de MariaDB sirve como archivo y no se importa desde la interfaz.
