# 18. Conformidad y Auditoría

La sección **Auditoría** registra automáticamente todas las operaciones sensibles realizadas en la plataforma, garantizando la trazabilidad completa requerida por la normativa del Tercer Sector.

## 18.1 Qué es el Registro de Auditoría
El registro de auditoría es un registro inmutable que documenta:
- **Quién** realizó la operación (usuario).
- **Qué** se hizo (tipo de acción).
- **Cuándo** ocurrió (marca temporal precisa).
- **Sobre qué entidad** se realizó la acción (socio, transacción, evento, etc.).
- **Qué valores** cambiaron (antes/después, cuando está disponible).

## 18.2 Operaciones Registradas
El sistema registra automáticamente las operaciones más relevantes, entre ellas:
- Creación, modificación y eliminación de socios.
- Registro y modificación de transacciones financieras.
- Creación y envío de comunicaciones.
- Aprobación de balances.
- Emisión de certificados.
- Modificaciones en los ajustes de la asociación.
- Gestión de la asistencia.

## 18.3 Consulta del Registro

### Acceso
El registro de auditoría es consultable a través de las API del sistema. La información disponible incluye:

### Filtros Disponibles
- **Por asociación**: Muestra solo las operaciones de una asociación específica.
- **Por entidad**: Filtra por tipo de entidad (ej. "MEMBER", "TRANSACTION") e ID específico.
- **Por fecha**: Selecciona un rango temporal con fechas de inicio y fin.
- **Por usuario**: Filtra las acciones de un usuario específico.

### Paginación
Los resultados están paginados para gestionar grandes volúmenes de datos. Es posible especificar:
- **Página**: Número de la página actual.
- **Tamaño**: Número de registros por página (por defecto 50).

## 18.4 Conteo de Operaciones
Existe un endpoint disponible para obtener el conteo total de las operaciones registradas para una asociación, útil para paneles de control y estadísticas.

## 18.5 Características Técnicas
- **Transacción independiente**: Cada entrada de auditoría se escribe en una transacción separada. Aunque la operación principal falle, el intento queda registrado en el registro.
- **Inmutabilidad**: Las entradas de auditoría no pueden ser modificadas ni eliminadas.
- **Indexación**: El registro está indexado por asociación, entidad, usuario y fecha para garantizar búsquedas rápidas.

## 18.6 Importancia para el Tercer Sector
La trazabilidad de las operaciones es un requisito fundamental para:
- **Revisión legal**: Las entidades con ingresos superiores a determinados importes están sujetas a revisión.
- **Controles fiscales**: La Agencia Tributaria puede solicitar documentación detallada.
- **Transparencia**: Los socios tienen derecho de acceso a los documentos asociativos.
- **Cumplimiento del RGPD**: El registro documenta quién realizó operaciones sobre los datos personales.

> **Nota**: El registro de auditoría es una funcionalidad interna de seguridad. El acceso al registro debería estar limitado a los administradores de la asociación y a los auditores de cuentas.
