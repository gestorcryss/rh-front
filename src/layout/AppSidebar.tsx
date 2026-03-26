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
  subItems?: SidebarSubItem[];
};

type SidebarSubItem = {
  name: string;
  path?: string;
  pro?: boolean;
  new?: boolean;
  children?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// ============================================================
// MENU - SISTEMA RH / FOLHA
// ============================================================
const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Funcionários",
    subItems: [
      { name: "Lista de Funcionários", path: "/funcionarios" },
      { name: "Cadastro de Funcionário", path: "/funcionarios/novo" },
      { name: "Contratos", path: "/contratos" },
    ],
  },
  {
    icon: <ListIcon />,
    name: "Rubricas",
    subItems: [
      { name: "Lista de Rubricas", path: "/rubricas" },
      { name: "Nova Rubrica", path: "/rubricas/novo" },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Movimentos Mensais",
    subItems: [
      { name: "Lançamentos do Mês", path: "/movimentos" },
      { name: "Faltas", path: "/movimentos/faltas" },
      { name: "Horas Extras", path: "/movimentos/horas-extras" },
      { name: "Bónus / Descontos", path: "/movimentos/bonus-descontos" },
    ],
  },
  // Itens adicionais para o menu
  // Configurações, Folha de Pagamento, Relatórios, Auditoria, etc.
  {
    icon: <TableIcon />,
    name: "Folha de Pagamento",
    subItems: [
      { name: "Processamento Mensal", path: "/folha/processamento" },
      { name: "Histórico de Folhas", path: "/folha/historico" },
      { name: "Recibos de Vencimento", path: "/folha/recibos" },
    ],
  },
   {
    icon: <PlugInIcon />,
    name: "Relatórios",
    subItems: [
      { name: "Mapa de Férias", path: "/relatorios/ferias" },
      { name: "Encargos Sociais", path: "/relatorios/encargos" },
      { name: "Declarações Fiscais", path: "/relatorios/declaracoes-fiscais" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Configurações",
    subItems: [
      {
        name: "Tabelas Auxiliares",
        children: [
          { name: "Tipos de Contrato", path: "/configuracoes/tabelas-auxiliares/tipos-contrato" },
          { name: "Departamentos", path: "/configuracoes/tabelas-auxiliares/departamentos" },
          { name: "Funções/Cargos", path: "/configuracoes/tabelas-auxiliares/funcoes" },
          { name: "Centros de Custo", path: "/configuracoes/tabelas-auxiliares/centros-custo" },
          { name: "Projetos", path: "/configuracoes/tabelas-auxiliares/projetos" },
        ],
      },
      {
        name: "⚖️ Configurações Tributárias",
        children: [
          { name: "Tabela IRT", path: "/configuracoes/tributarias/irt" },
        ],
      },
      { name: "Roles e Permissões", path: "/configuracoes/roles-permissoes" },
    ],
  },
  
 
  {
    icon: <ListIcon />,
    name: "Auditoria",
    subItems: [{ name: "Logs do Sistema", path: "/auditoria/logs" }],
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

  const getAllPaths = useCallback((subItems: SidebarSubItem[]) => {
    const paths: string[] = [];
    subItems.forEach((s) => {
      if (s.path) paths.push(s.path);
      if (s.children) s.children.forEach((c) => paths.push(c.path));
    });
    return paths;
  }, []);

  // Abrir submenu automaticamente se um item estiver ativo
  useEffect(() => {
    let submenuMatched = false;

    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        const paths = getAllPaths(nav.subItems);
        if (paths.some((p) => isSubItemActive(p))) {
          setOpenSubmenu({ type: "main", index });
          submenuMatched = true;
        }
      } else if (nav.path && isSubItemActive(nav.path)) {
        submenuMatched = true;
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, getAllPaths, isSubItemActive]);

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
                {nav.subItems.map((subItem) => {
                  if (subItem.children && subItem.children.length > 0) {
                    return (
                      <li key={subItem.name} className="pt-2">
                        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {subItem.name}
                        </div>
                        <ul className="space-y-1 ml-3">
                          {subItem.children.map((child) => (
                            <li key={child.name}>
                              <Link
                                to={child.path}
                                className={`menu-dropdown-item ${
                                  isActive(child.path)
                                    ? "menu-dropdown-item-active"
                                    : "menu-dropdown-item-inactive"
                                }`}
                              >
                                {child.name}
                                <span className="flex items-center gap-1 ml-auto">
                                  {child.new && (
                                    <span
                                      className={`ml-auto ${
                                        isActive(child.path)
                                          ? "menu-dropdown-badge-active"
                                          : "menu-dropdown-badge-inactive"
                                      } menu-dropdown-badge`}
                                    >
                                      new
                                    </span>
                                  )}
                                  {child.pro && (
                                    <span
                                      className={`ml-auto ${
                                        isActive(child.path)
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
                      </li>
                    );
                  }

                  if (!subItem.path) {
                    return (
                      <li key={subItem.name}>
                        <div className="px-3 py-2 text-sm text-gray-500">
                          {subItem.name}
                        </div>
                      </li>
                    );
                  }

                  return (
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
                  );
                })}
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
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "SISTEMA RH / FOLHA"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
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