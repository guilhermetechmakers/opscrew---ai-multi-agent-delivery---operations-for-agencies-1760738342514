import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Zap, 
  Kanban, 
  Video, 
  Code, 
  Rocket, 
  HandHeart, 
  Headphones, 
  Settings, 
  Shield,
  ChevronDown,
  ChevronRight,
  Plus,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Essentials",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Intake Chat", href: "/dashboard/intake", icon: MessageSquare },
      { name: "Proposals", href: "/dashboard/proposals", icon: FileText },
    ]
  },
  {
    name: "Projects",
    items: [
      { name: "Provisioning", href: "/dashboard/provisioning", icon: Zap },
      { name: "Project Board", href: "/dashboard/projects", icon: Kanban },
      { name: "Comms", href: "/dashboard/comms", icon: Video },
      { name: "Research", href: "/dashboard/research", icon: Code },
      { name: "Launch", href: "/dashboard/launch", icon: Rocket },
    ]
  },
  {
    name: "Support",
    items: [
      { name: "Handover", href: "/dashboard/handover", icon: HandHeart },
      { name: "Support", href: "/dashboard/support", icon: Headphones },
    ]
  },
  {
    name: "Admin",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      { name: "Admin", href: "/dashboard/admin", icon: Shield },
    ]
  }
];

export function Sidebar() {
  const [openSections, setOpenSections] = useState<string[]>(["Essentials", "Projects"]);

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">OpsCrew</h1>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <Button className="w-full btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.name}>
              <Collapsible
                open={openSections.includes(section.name)}
                onOpenChange={() => toggleSection(section.name)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-2 h-auto font-medium text-muted-foreground hover:text-foreground"
                  >
                    {section.name}
                    {openSections.includes(section.name) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-2">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        cn(
                          "sidebar-item",
                          isActive && "sidebar-item-active"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
