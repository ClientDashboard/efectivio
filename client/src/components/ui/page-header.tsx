import React from "react";
import { 
  Users, FileText, CreditCard, BarChart, 
  Briefcase, Calendar, Settings, 
  FileSpreadsheet, Files, Box, Activity,
  LayoutDashboard, ChevronRight, Building2,
  Archive, Clock, User, ShoppingCart,
  PieChart, Award
} from "lucide-react";

// Mapa de iconos disponibles para usar en el encabezado
const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="h-8 w-8" />,
  user: <User className="h-8 w-8" />,
  file: <FileText className="h-8 w-8" />,
  files: <Files className="h-8 w-8" />,
  credit: <CreditCard className="h-8 w-8" />,
  chart: <BarChart className="h-8 w-8" />,
  pie: <PieChart className="h-8 w-8" />,
  briefcase: <Briefcase className="h-8 w-8" />,
  calendar: <Calendar className="h-8 w-8" />,
  settings: <Settings className="h-8 w-8" />,
  spreadsheet: <FileSpreadsheet className="h-8 w-8" />,
  box: <Box className="h-8 w-8" />,
  activity: <Activity className="h-8 w-8" />,
  dashboard: <LayoutDashboard className="h-8 w-8" />,
  company: <Building2 className="h-8 w-8" />,
  archive: <Archive className="h-8 w-8" />,
  time: <Clock className="h-8 w-8" />,
  shopping: <ShoppingCart className="h-8 w-8" />,
  award: <Award className="h-8 w-8" />
};

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  breadcrumb?: { label: string; href?: string }[];
}

// Componentes más genéricos para mayor flexibilidad
export function PageHeader({ 
  title, 
  description, 
  icon = "dashboard",
  breadcrumb,
  children 
}: PageHeaderProps & { children?: React.ReactNode }) {
  const IconComponent = icon && iconMap[icon] ? iconMap[icon] : iconMap.dashboard;

  // Si se proporciona children, renderizar eso en lugar del título y descripción predeterminados
  if (children) {
    return (
      <div className="mb-8">
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
                {item.href ? (
                  <a 
                    href={item.href} 
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span>{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {children}
      </div>
    );
  }

  // Renderizado estándar con título y descripción
  return (
    <div className="mb-8">
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
              {item.href ? (
                <a 
                  href={item.href} 
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          {IconComponent}
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para el encabezado principal
export function PageHeaderHeading({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold tracking-tight">{children}</h1>;
}

// Componente para la descripción del encabezado
export function PageHeaderDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}