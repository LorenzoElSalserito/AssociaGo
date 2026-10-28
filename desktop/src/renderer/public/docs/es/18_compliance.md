# 18. Conformidad y Auditoría

Las herramientas de conformidad disponibles hoy están en la pestaña **Ajustes › Registro**: sedes, documentos institucionales y vencimientos de la asociación.

**Registro de actividad.** AssociaGo registra automáticamente cada **creación**, **modificación** y **eliminación** de los datos principales: socios y afiliaciones, movimientos y facturas, actividades, eventos y participantes, asambleas y mociones, inventario y préstamos, voluntarios, turnos y reembolsos, cupones, presupuestos, balances, certificados, comunicaciones, perfil de la asociación, firmas y configuración de la base de datos.

Para consultarlo abre **Ajustes › Registro de actividad**. La tabla, desde la entrada más reciente, muestra:
- **Fecha y hora** de la operación;
- **Área** (por ejemplo Socios, Finanzas, Eventos);
- **Acción**: Creación, Modificación o Eliminación;
- **Registro**: el tipo de dato y su número identificativo;
- **Detalle**: en las modificaciones, los nombres de los campos cambiados.

Puedes filtrar por **Área**, **Acción** e intervalo de fechas (**Desde**, **Hasta**); **Borrar filtros** vuelve a la lista completa. Las entradas se dividen en páginas de 25.

Lo que **no** se registra:
- los valores de los campos, ni antes ni después de la modificación: solo sus nombres;
- contraseñas, códigos de acceso, credenciales de la base de datos, imágenes de logotipos y firmas;
- quién ha realizado la operación: el acceso es por asociación, no por usuario individual.

> Cada asociación solo ve su propio registro. El registro no se puede modificar desde la app y se borra junto con la asociación.

## 18.1 Sedes

Rellena la fila superior y pulsa **Añadir**:
- tipo: **Sede legal**, **Sede operativa** o **Sede proyecto**;
- **Nombre**, **Dirección**, **Ciudad** y provincia (**Prov.**).

La tabla muestra **Tipo**, **Nombre**, **Dirección** y **Contactos**. La papelera elimina la sede.

> La columna **Contactos** queda vacía: el formulario no tiene campos para el teléfono y el correo de la sede.

## 18.2 Documentos

Para archivar estatutos, reglamentos y otros documentos:
1. elige el tipo: **Estatuto**, **Reglamento** o **Adjunto**;
2. escribe un **Título**;
3. selecciona el archivo y pulsa **Subir**.

El archivo se copia en la carpeta de datos de AssociaGo. La tabla muestra **Tipo**, **Título** y, en la columna **Archivo**, la ruta en la que se ha guardado. La papelera elimina tanto la fila como el archivo copiado.

> Desde la app no se puede abrir ni descargar el documento: para consultarlo, abre el archivo desde la ruta indicada.

## 18.3 Vencimientos

Para anotar obligaciones como renovaciones de seguros, declaraciones o asambleas obligatorias:
- **Título** y fecha de vencimiento;
- categoría: **Fiscal**, **Legal**, **Gobernanza**, **Seguros** u **Otro**;
- un campo numérico, predefinido en 30: los días de preaviso.

Pulsa **Añadir**. La tabla muestra **Título**, **Fecha de vencimiento**, **Categoría** y **Estado**. Cuando la obligación esté cumplida pulsa **Marcar como completada**: el vencimiento pasa a completado y el botón desaparece. La papelera lo elimina.

> Los vencimientos son un recordatorio que se consulta a mano. Los días de preaviso se guardan, pero la app no envía avisos ni notificaciones, no señala los vencimientos pasados y no vuelve a crear los recurrentes.

> Las eliminaciones en esta pestaña (sedes, documentos, vencimientos) son inmediatas y no piden confirmación.
