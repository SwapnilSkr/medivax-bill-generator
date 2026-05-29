"use client";

import { Fragment } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DashboardActionItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  onSelect?: () => void;
  variant?: "default" | "destructive";
  separatorBefore?: boolean;
}

interface DashboardRowActionsMenuProps {
  items: DashboardActionItem[];
  align?: "start" | "end";
}

export function DashboardRowActionsMenu({
  items,
  align = "end",
}: DashboardRowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg px-2.5"
          aria-label="Open actions menu"
        >
          Actions
          <ChevronDown className="size-3.5 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-46">
        {items.map((item, index) => {
          const Icon = item.icon;
          const row = (
            <>
              <Icon className="size-4" />
              {item.label}
            </>
          );

          return (
            <Fragment key={`${item.label}-${index}`}>
              {item.separatorBefore && index > 0 ? <DropdownMenuSeparator /> : null}
              {item.href ? (
                <DropdownMenuItem asChild variant={item.variant}>
                  <Link href={item.href}>{row}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  variant={item.variant}
                  onSelect={(event) => {
                    event.preventDefault();
                    item.onSelect?.();
                  }}
                >
                  {row}
                </DropdownMenuItem>
              )}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
