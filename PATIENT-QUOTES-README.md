# 🏥 Sistema de Quotes para Pacientes

## ✨ Funcionalidades Implementadas

### 1. **Navbar Mejorado**
- Logo de la aplicación (🏥 HealthQuote)
- Información del usuario autenticado (avatar, email, rol)
- Botón de cerrar sesión visible
- Conditional rendering: muestra Login/Registro cuando no hay usuario

### 2. **Panel del Paciente** 
Con dos secciones principales en tabs:

#### 📝 **Solicitar Presupuesto**
- Formulario para crear solicitudes de presupuesto
- Campos:
  - Título
  - Tipo de servicio (consulta, terapia, diagnóstico, etc.)
  - Descripción detallada
- Validación de formulario
- Mensajes de éxito/error
- Diseño moderno y responsive

#### 💼 **Mis Presupuestos**
- Lista de todas las solicitudes del paciente
- Cada solicitud muestra:
  - Título y descripción
  - Fecha de creación
  - Tipo de servicio
  - Estado (abierto/cerrado/cancelado)
  - **Ofertas recibidas** de especialistas con:
    - Email del especialista
    - Precio ofertado
    - Tiempo estimado
    - Descripción de la oferta
    - Botones para aceptar/rechazar (próximamente funcionales)
- Estados de carga y errores
- Diseño tipo tarjetas con excelente UX

## 🗄️ Estructura de Base de Datos

### Tablas Creadas

#### `quote_requests` (Solicitudes de Presupuesto)
```sql
- id: UUID (PK)
- patient_id: UUID (FK → auth.users)
- patient_email: TEXT
- title: TEXT
- description: TEXT
- service_type: TEXT
- status: TEXT (open/closed/cancelled)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `quotes` (Ofertas de Especialistas)
```sql
- id: UUID (PK)
- request_id: UUID (FK → quote_requests)
- specialist_id: UUID (FK → auth.users)
- specialist_email: TEXT
- price: DECIMAL(10, 2)
- estimated_time: TEXT
- description: TEXT
- status: TEXT (pending/accepted/rejected)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Políticas de Seguridad (RLS)

#### quote_requests:
- ✅ Los pacientes pueden ver **sus propias** solicitudes
- ✅ Los pacientes pueden **crear** solicitudes
- ✅ Los especialistas pueden ver **todas** las solicitudes (para poder ofertar)

#### quotes:
- ✅ Los especialistas pueden **crear** ofertas
- ✅ Los pacientes pueden ver ofertas para **sus solicitudes**
- ✅ Los especialistas pueden ver **sus propias** ofertas

## 🚀 Instalación y Configuración

### 1. **Configurar Base de Datos en Supabase**

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta el archivo:

```bash
supabase-setup.sql
```

O copia y pega el contenido completo del archivo SQL que se encuentra en la raíz del proyecto.

### 2. **Verificar la Configuración**

Después de ejecutar el SQL, verifica que:

```sql
-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('quote_requests', 'quotes');

-- Ver políticas RLS
SELECT * FROM pg_policies 
WHERE tablename IN ('quote_requests', 'quotes');
```

### 3. **Probar el Sistema**

1. **Como Paciente:**
   - Inicia sesión con un usuario con rol "paciente"
   - Ve a `/paciente`
   - Solicita un presupuesto en la pestaña "Solicitar Presupuesto"
   - Ve tus solicitudes en "Mis Presupuestos"

2. **Como Especialista:** (Próximamente)
   - Verá todas las solicitudes abiertas
   - Podrá enviar ofertas a las solicitudes

## 🎨 Características de UX

### Diseño Visual
- ✨ Gradiente moderno (púrpura-azul)
- 🎯 Tabs intuitivos con iconos
- 💳 Tarjetas con hover effects
- 🔵 Badges de estado con colores semánticos
- 📱 Totalmente responsive

### Interactividad
- ⚡ Carga asíncrona con spinners
- ✅ Mensajes de éxito/error
- 🔄 Auto-refresh de datos
- 👁️ Estados vacíos informativos
- 🎭 Animaciones suaves

### Accesibilidad
- Labels claros en formularios
- Campos requeridos marcados (*)
- Mensajes de error descriptivos
- Contraste de colores adecuado
- Navegación por teclado

## 📦 Componentes Creados

```
src/
├── components/
│   ├── Navbar.tsx              # Navbar con info de usuario
│   ├── RequestQuote.tsx        # Formulario para solicitar presupuesto
│   ├── MyQuotes.tsx            # Lista de presupuestos y ofertas
│   └── FallbackProfileBanner.tsx # (Ya existía)
├── views/
│   └── PacienteDashboard.tsx   # Dashboard principal con tabs
├── types/
│   └── quote.types.ts          # Tipos TypeScript para quotes
└── App.css                     # Estilos completos
```

## 🔧 Próximas Funcionalidades

- [ ] Funcionalidad de aceptar/rechazar ofertas
- [ ] Panel de especialista para ver solicitudes y enviar ofertas
- [ ] Notificaciones en tiempo real (Supabase Realtime)
- [ ] Filtros y búsqueda de solicitudes
- [ ] Chat entre paciente y especialista
- [ ] Sistema de calificaciones
- [ ] Historial de transacciones

## 🐛 Troubleshooting

### Error: "Database error saving new user"
- **Causa:** El trigger antiguo aún existe
- **Solución:** Ejecuta en SQL Editor:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

### No puedo crear solicitudes
- **Verifica:** Que estés autenticado como paciente
- **Verifica:** Que las tablas existan
- **Verifica:** Que las políticas RLS estén activas

### No veo las ofertas
- **Verifica:** Que haya especialistas que hayan enviado ofertas
- **Verifica:** Las políticas RLS de la tabla `quotes`

## 📝 Notas Técnicas

- Se usa `user_metadata` para los roles (sin tabla profiles)
- RLS asegura que cada usuario solo vea sus datos
- Los precios se formatean en EUR
- Las fechas se muestran en formato español
- Auto-hide de mensajes de éxito después de 5 segundos

## 🎯 Ejemplo de Flujo Completo

1. **Paciente** crea solicitud: "Necesito consulta nutricional"
2. Sistema guarda en `quote_requests` con `status: 'open'`
3. **Especialistas** ven la solicitud (verán todas las solicitudes abiertas)
4. **Especialista A** envía oferta: €50, 30 minutos
5. **Especialista B** envía oferta: €45, 45 minutos
6. **Paciente** ve ambas ofertas en "Mis Presupuestos"
7. **Paciente** acepta la oferta de Especialista B
8. Sistema actualiza `status` de la oferta a `'accepted'`

## 📞 Soporte

Si encuentras algún problema, verifica:
1. Que las tablas estén creadas correctamente
2. Que las políticas RLS estén activas
3. Que el usuario tenga el rol correcto en `user_metadata`
4. La consola del navegador para errores específicos

---

**Hecho con ❤️ usando React + TypeScript + Supabase + Redux**

