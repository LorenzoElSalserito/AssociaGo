# 1. AssociaGo: introducción, acceso e interfaz

**AssociaGo** es el programa de gestión de escritorio para asociaciones (APS, ASD, ODV, ETS). Los datos se guardan en una base de datos local SQLite o en una base de datos MariaDB de tu organización (consulta el capítulo 10).

Este manual describe las funciones tal como están en la aplicación. Cuando una función es solo parcial, se indica.

## 1.1 Primer inicio y acceso

### Primer inicio: configurar la asociación
Si en el equipo todavía no hay ninguna asociación, AssociaGo abre el formulario **Configurar Nueva Asociación**, dividido en dos secciones:

1. **Datos de la asociación**: *Nombre de la Asociación*, *Tipo* (APS, ASD, ODV, ETS, Otro) y *Código Fiscal (C.F.)*. Debajo del campo aparece el formato esperado para el idioma elegido: para el italiano son 11 cifras.
2. **Acceso de administrador**: *Correo del Administrador* y *Contraseña Maestra*, de al menos 6 caracteres. El icono del ojo muestra u oculta la contraseña.

Marca **Mantenerme conectado** si quieres entrar automáticamente en los próximos inicios y pulsa **Inicializar Base de Datos**. Si falta un campo o el código fiscal no respeta el formato, aparece un aviso y no se crea nada. Al terminar entras directamente en la aplicación.

### Acceso
En los inicios siguientes ves **Seleccionar Asociación** con las asociaciones ya usadas en este equipo. Puedes seleccionarlas con el ratón o con el teclado (Tab y después Intro).

- Elige la asociación, introduce la contraseña y pulsa **Iniciar Sesión**.
- **Mantenerme conectado** guarda el acceso: en el siguiente inicio entras sin contraseña.
- **Añadir otra asociación** vuelve a abrir el formulario de configuración.
- El icono de la papelera quita la asociación de la lista de este equipo, tras una confirmación. Los datos de la base de datos no se borran.
- Arriba a la derecha está el selector de idioma: IT, EN, ES, DE, FR.

Al iniciarse, AssociaGo comprueba las asociaciones de la lista y quita las que ya no existen en la base de datos en uso, por ejemplo después de cambiar a otra base de datos.

### Recuperación de contraseña
Pulsa **¿Olvidaste tu contraseña?** en la pantalla de la contraseña. El procedimiento también se abre solo tras dos contraseñas incorrectas.

1. **¿Estas asociaciones son tuyas?** Elige la asociación y confirma con **SÍ**.
2. Introduce el **código fiscal de la asociación** y después la nueva contraseña dos veces (al menos 6 caracteres).
3. **Restablecer contraseña** guarda la nueva contraseña e inicia sesión de inmediato.

> La recuperación se basa en el código fiscal registrado. Quien tenga acceso al equipo y conozca el código fiscal puede restablecer la contraseña: protege la cuenta del sistema operativo.

## 1.2 Interfaz

### Navegación
La barra lateral agrupa las secciones en *Resumen*, *Personas*, *Actividades*, *Administración*, *Gobernanza* y *Ayuda*. El botón de abajo la contrae, dejando solo los iconos, y la vuelve a expandir. También abajo encuentras la versión de la aplicación. Si usas el teclado, puedes pulsar Tab al abrir para activar **Ir al contenido**.

### Búsqueda de funciones (paleta de comandos)
Pulsa **Buscar función** en la barra superior o <kbd>Ctrl</kbd>+<kbd>K</kbd> (<kbd>⌘</kbd>+<kbd>K</kbd> en macOS). Escribe el nombre de una sección, o "Nuevo Socio" para abrir directamente el formulario de alta. Usa las flechas para moverte, Intro para abrir y Esc para cerrar.

### Tema claro y oscuro
El botón sol/luna de la barra superior cambia el tema y lo recuerda. También puedes elegirlo en **Ajustes › General**: allí la elección se confirma con **Guardar Preferencias**.

### Menú de la asociación
El círculo con las iniciales, arriba a la derecha, muestra el nombre y el correo de la asociación. Contiene:
- **Ajustes**;
- **Info de la App**: versión, licencia AGPLv3, advertencias y el botón **Apoyar con una donación**;
- **Cerrar Sesión**, que cierra la sesión. Si habías elegido *Mantenerme conectado*, ese acceso automático se elimina.

### Conexión con el motor de datos
AssociaGo usa un motor local que se inicia junto con la aplicación.
- Si al iniciar el motor no responde, aparece una pantalla con **Reintentar**.
- Si la conexión se interrumpe mientras trabajas, aparece el aviso "Servidor no disponible" con **Reintentar**. Las lecturas se repiten, los guardados no: antes de repetir un guardado comprueba si ya se había completado.

## 1.3 Tablero

El **Tablero** es la primera página después del acceso.

### Indicadores principales
Tres tarjetas, cada una con un enlace a su sección:
1. **Socios Activos**: número de socios con estado *activo* y número de socios nuevos en el mes actual. El estado es el registrado en la inscripción: la fecha de vencimiento no se vuelve a comprobar automáticamente.
2. **Saldo de Tesorería**: ingresos menos gastos registrados en Finanzas, con el total de ingresos (verde) y de gastos (rojo) del mes actual.
3. **Próximos Eventos**: eventos futuros no cancelados, con el nombre y la fecha del próximo.

### Actividad reciente
Muestra las últimas 5 operaciones: socios nuevos, pagos, eventos. **Ver Todo** muestra hasta 20. La flecha junto a cada fila abre la sección correspondiente.

### Acciones rápidas
- **Registrar Nuevo Socio** abre el formulario de alta.
- **Crear Evento** abre el formulario de nuevo evento.
- **Registrar Pago** lleva a Finanzas.

Si los datos no se cargan, aparece un mensaje con **Reintentar**.

### Manual
Este manual se abre desde la entrada **Manual de Usuario** de la barra lateral y sigue el idioma de la interfaz.
