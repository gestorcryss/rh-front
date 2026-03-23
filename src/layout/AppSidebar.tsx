import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Ícones do sistema (importados do seu arquivo de ícones)
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";

import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

// ============================================================
// ESTRUTURA DO MENU - SISTEMA DE RH E FOLHA DE PAGAMENTO
// ============================================================

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// ============================================================
// MENU PRINCIPAL
// ============================================================
const mainNavItems: NavItem[] = [
  // Dashboard
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Principal", path: "/dashboard", pro: false }],
  },

  // Funcionários
  {
    icon: <UserCircleIcon />,
    name: "Funcionários",
    subItems: [
      { name: "Listar Funcionários", path: "/funcionarios", pro: false },
      { name: "Novo Funcionário", path: "/funcionarios/novo", pro: false },
      { name: "Dados Pessoais", path: "/funcionarios/dados-pessoais", pro: false },
    ],
  },

  // Contratos
  {
    icon: <PageIcon />,
    name: "Contratos",
    subItems: [
      { name: "Listar Contratos", path: "/contratos", pro: false },
      { name: "Novo Contrato", path: "/contratos/novo", pro: false },
      { name: "Versões de Contrato", path: "/contratos/versoes", pro: false },
    ],
  },

  // Rubricas
  {
    icon: <ListIcon />,
    name: "Rubricas",
    subItems: [
      { name: "Listar Rubricas", path: "/rubricas", pro: false },
      { name: "Nova Rubrica", path: "/rubricas/novo", pro: false },
      { name: "Versões de Rubrica", path: "/rubricas/versoes", pro: false },
    ],
  },

  // Estrutura Salarial
  {
    icon: <PieChartIcon />,
    name: "Estrutura Salarial",
    subItems: [
      { name: "Minhas Estruturas", path: "/estrutura-salarial", pro: false },
      { name: "Nova Estrutura", path: "/estrutura-salarial/novo", pro: false },
      { name: "Itens da Estrutura", path: "/estrutura-salarial/itens", pro: false },
    ],
  },

  // Movimentos Mensais
  {
    icon: <CalenderIcon />,
    name: "Movimentos",
    subItems: [
      { name: "Listar Movimentos", path: "/movimentos", pro: false },
      { name: "Lançar Falta", path: "/movimentos/falta", pro: false },
      { name: "Lançar Hora Extra", path: "/movimentos/hora-extra", pro: false },
      { name: "Movimentos Pendentes", path: "/movimentos/pendentes", pro: false },
    ],
  },

  // Folha de Pagamento
  {
    icon: <TableIcon />,
    name: "Folha de Pagamento",
    subItems: [
      { name: "Processamentos", path: "/processamentos", pro: false },
      { name: "Novo Processamento", path: "/processamentos/novo", pro: false },
      { name: "Relatório de Folha", path: "/processamentos/relatorios", pro: false },
    ],
  },
];

// ============================================================
// MENU SECUNDÁRIO (OUTROS)
// ============================================================
const othersNavItems: NavItem[] = [
  // Configurações do Sistema
  {
    icon: <BoxCubeIcon />,
    name: "Configurações",
    subItems: [
      { name: "Configuração Tributária", path: "/configuracoes/tributaria", pro: false },
      { name: "Departamentos", path: "/configuracoes/departamentos", pro: false },
      { name: "Funções/Cargos", path: "/configuracoes/funcoes", pro: false },
      { name: "Centros de Custo", path: "/configuracoes/centro-custo", pro: false },
      { name: "Projetos", path: "/configuracoes/projetos", pro: false },
      { name: "Tipos de Contrato", path: "/configuracoes/tipo-contrato", pro: false },
    ],
  },

  // Relatórios
  {
    icon: <PlugInIcon />,
    name: "Relatórios",
    subItems: [
      { name: "Recibo de Vencimento", path: "/relatorios/recibo", pro: false },
      { name: "Mapa de Férias", path: "/relatorios/ferias", pro: false },
      { name: "Encargos Sociais", path: "/relatorios/encargos", pro: false },
      { name: "Folha Mensal", path: "/relatorios/folha-mensal", pro: false },
      { name: "Funcionários", path: "/relatorios/funcionarios", pro: false },
    ],
  },

  // Segurança
  {
    icon: <BoxCubeIcon />,
    name: "Segurança",
    subItems: [
      { name: "Usuários", path: "/seguranca/usuarios", pro: false },
      { name: "Perfis (Roles)", path: "/seguranca/perfis", pro: false },
      { name: "Permissões", path: "/seguranca/permissions", pro: false },
      { name: "Logs de Acesso", path: "/seguranca/logs", pro: false },
    ],
  },

  // Auditoria
  {
    icon: <ListIcon />,
    name: "Auditoria",
    subItems: [
      { name: "Logs de Alterações", path: "/auditoria/logs", pro: false },
      { name: "Histórico de Processamentos", path: "/auditoria/processamentos", pro: false },
      { name: "Relatório de Auditoria", path: "/auditoria/relatorio", pro: false },
    ],
  },

  // Calendário de Férias
  {
    icon: <CalenderIcon />,
    name: "Férias",
    path: "/ferias",
  },
];

// ============================================================
// COMPONENTE PRINCIPAL DO SIDEBAR
// ============================================================
const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Verificar se um caminho está ativo
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Verificar se um subitem está ativo
  const isSubItemActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Abrir submenu automaticamente se um item estiver ativo
  useEffect(() => {
    let submenuMatched = false;

    // Verificar no menu principal
    mainNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isSubItemActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });

    // Verificar no menu others
    othersNavItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isSubItemActive(subItem.path)) {
            setOpenSubmenu({ type: "others", index });
            submenuMatched = true;
          }
        });
      } else if (nav.path && isSubItemActive(nav.path)) {
        // Se for item sem submenu e estiver ativo
        submenuMatched = true;
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isSubItemActive]);

  // Calcular altura do submenu para animação
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // Alternar submenu
  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  // Renderizar itens do menu
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            // Item com submenu
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            // Item sem submenu (link direto)
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {/* Submenu dropdown */}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Navegação */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* Menu Principal */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "MENU PRINCIPAL"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(mainNavItems, "main")}
            </div>

            {/* Menu Secundário */}
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "ADMINISTRAÇÃO"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersNavItems, "others")}
            </div>
          </div>
        </nav>

        {/* Widget do Sidebar (opcional) */}
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;