"use client";

import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";
import { ReactNode, useEffect, useState } from "react";

interface NavbarProps {
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
}

export function Navbar({ leftContent, centerContent, rightContent }: NavbarProps) {
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
        {rightContent}
      </NavbarContent>
    </HeroNavbar>
  );
} 