# 2. Gestión de Socios (Members)

La sección **Socios** es el corazón de AssociaGo. Aquí puedes gestionar el registro completo de todos los miembros.

## 2.1 Lista de Socios
La tabla principal muestra:
- **Nombre y Apellido**
- **Correo Electrónico**
- **Estado**: (Activo, Caducado, Suspendido)
- **Vencimiento de la Membresía**: Fecha de finalización de la validez de la inscripción.
- **Rol**: (Socio, Presidente, Secretario, etc.)

### Filtros y Búsqueda
Utiliza la barra de búsqueda en la parte superior para encontrar rápidamente a un socio escribiendo nombre, apellido o número de socio.

## 2.2 Añadir un Nuevo Socio
Al hacer clic en **"Añadir Socio"**, se abre un formulario detallado dividido en secciones:

### Datos Personales
- **Nombre y Apellido**: Obligatorios.
- **Fecha de Nacimiento**: Fundamental para el cálculo del Código Fiscal (en Italia).
- **Género**: Hombre/Mujer.
- **Lugar de Nacimiento**: Municipio o país extranjero.
- **Código Catastral**: (ej. H501 para Roma). Necesario para el cálculo automático del CF.

### Código Fiscal
El sistema incluye una **calculadora automática**. Al introducir los datos personales y hacer clic en "Calcular", el campo se rellenará automáticamente. Siempre es posible modificarlo manualmente.

### Contactos y Dirección
- **Correo y Teléfono**: Para comunicaciones.
- **Dirección Completa**: Calle, Ciudad, Código Postal.

### Datos Asociativos
- **Número de Socio**: Asignado manualmente o automáticamente si está configurado.
- **Rol**: Define los permisos y el cargo social.
- **Fecha de Inscripción**: Fecha de entrada en la asociación.

### Registro de Pago Contextual
En la parte inferior del formulario, está la opción **"Registrar Pago de Cuota de Socio"**.
Si se selecciona:
1.  Se activan los campos para el importe (predeterminado configurable) y el método de pago.
2.  Al guardar, el sistema crea **automáticamente** una transacción de entrada en la contabilidad, vinculada al nuevo socio.

## 2.3 Acciones sobre el Socio
Para cada fila de la tabla, hay tres acciones rápidas disponibles:
1.  **Renovar (Icono Recargar)**: Extiende la validez de la tarjeta por un año (o el período configurado) y actualiza el estado a "Activo".
2.  **Editar (Icono Lápiz)**: Abre el formulario para actualizar los datos.
3.  **Eliminar (Icono Papelera)**: Elimina al socio (acción irreversible, pero mantenida en los registros).

## 2.4 Impresión de Tarjeta de Socio
Desde la lista o la vista detallada, puedes descargar el **PDF de la Tarjeta de Socio**, listo para imprimir, completo con el logotipo de la asociación y los datos del socio.
