"use client";

import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";

interface NavbarProps {
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
}

export function Navbar({ leftContent, centerContent, rightContent }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <HeroNavbar className="border-b">
        <NavbarContent justify="start">
          <NavbarBrand>
            {leftContent}
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="center">
          {centerContent}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
            >
              🌙
            </Button>
          </NavbarItem>
          {rightContent}
        </NavbarContent>
      </HeroNavbar>
    );
  }

  return (
    <HeroNavbar className="border-b">
      <NavbarContent justify="start">
        <NavbarBrand>
          {leftContent}
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center">
        {centerContent}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mr-2"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </Button>
        </NavbarItem>
        {rightContent}
      </NavbarContent>
    </HeroNavbar>
  );
} 