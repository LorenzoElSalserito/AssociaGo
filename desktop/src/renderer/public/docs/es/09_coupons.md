# 9. Cupones y Descuentos

Los cupones son códigos de descuento para actividades y eventos. Los gestionas desde tres puntos, que muestran la misma lista:
- la entrada **Cupones** del grupo **Actividades** del menú lateral;
- la pestaña **Cupones** de la página **Actividades y Cupones**;
- la pestaña **Cupones** de la página **Eventos y Cupones**.

## 9.1 Lista de cupones

Para cada cupón la tabla muestra:
- **Código**;
- **Descuento**: porcentaje o importe en euros, con el importe mínimo si está definido;
- **Validez**: fecha de inicio y de fin (∞ si no vence);
- **Usos**: inscripciones guardadas con el cupón sobre el máximo permitido (∞ si son ilimitados);
- **Estado**: **Activo** o **Inactivo**.

Las acciones de cada fila son **Editar** y **Eliminar**.

## 9.2 Crear un cupón

Pulsa **Añadir Cupón** y rellena:
- **Código de Cupón** (obligatorio), p. ej. VERANO2026.
- **Descripción**.
- **Tipo de Descuento**: Porcentaje o Importe Fijo.
- **Valor del Descuento** (obligatorio).
- **Fecha de Inicio** (por defecto hoy) y **Fecha de Fin**.
- **Máx. Usos (0 para ilimitado)**.
- **Importe Mínimo**.
- **Actividades Aplicables** y **Eventos Aplicables**: selección múltiple. Si eliges al menos una actividad o un evento, el cupón solo vale para los elegidos; deja ambas listas vacías para que valga en todas partes.
- **Activo**.

Pulsa **Guardar Cupón**.

## 9.3 Uso

El código se introduce en el campo **Código de cupón** del formulario **Añadir Participante**, tanto en las actividades como en los eventos (socios e invitados). Las mayúsculas no importan. Pulsa **Aplicar** para ver el precio, el descuento y el **Importe a pagar** antes de guardar.

El precio de partida es:
- en las actividades, el costo de la actividad;
- en los eventos, el costo para socios en el caso de los socios y el costo para no socios en el de los invitados.

El descuento porcentual se redondea al céntimo; el fijo nunca supera el precio, así que el importe a pagar no baja de cero.

El cupón se rechaza, con un mensaje, si:
- el código no existe en la asociación;
- no está **Activo**;
- hoy es anterior a la **Fecha de Inicio** o posterior a la **Fecha de Fin** (la fecha de fin está incluida);
- ha alcanzado **Máx. Usos** (0 = ilimitado);
- el precio es inferior al **Importe Mínimo**;
- no vale para la actividad o el evento elegido (consulta 9.2).

Al guardar, el programa vuelve a comprobar el cupón: si mientras tanto ha dejado de ser válido, la inscripción no se guarda. Si es válido, en el participante quedan el cupón, el descuento y el importe a pagar, y **Usos** aumenta en 1. El cupón aparece como etiqueta en la tabla de participantes y los **Ingresos** usan el importe con descuento.

> Quitar un participante **no** devuelve el uso: el contador cuenta los cupones usados, también en inscripciones canceladas después. Si hace falta, aumenta **Máx. Usos** desde el formulario de edición.
