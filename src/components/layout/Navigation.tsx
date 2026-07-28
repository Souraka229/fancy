'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue', href: '/catalog' },
    { label: 'Nouveautés', href: '/catalog?sort=new' },
    { label: 'Best Sellers', href: '/catalog?sort=popular' },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-canvas border-b border-ink-tertiary">
        <div className="max-w-container-xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="font-display text-2xl font-medium text-ink">
              DAYDAY'S FANCY
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-ui text-ink-muted hover:text-ink transition-colors duration-fast"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-ink hover:text-ink-muted transition-colors duration-fast"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link href="/cart" className="p-2 text-ink hover:text-ink-muted transition-colors duration-fast" aria-label="Cart">
                <ShoppingBag size={20} />
              </Link>
              <Link href="/account" className="p-2 text-ink hover:text-ink-muted transition-colors duration-fast" aria-label="Account">
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-canvas border-b border-ink-tertiary">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-ink hover:text-ink-muted transition-colors duration-fast"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href="/" className="font-display text-lg font-medium text-ink">
            DAYDAY'S
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-ink hover:text-ink-muted transition-colors duration-fast"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link href="/cart" className="p-2 text-ink hover:text-ink-muted transition-colors duration-fast" aria-label="Cart">
              <ShoppingBag size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-canvas">
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-ink-tertiary">
              <span className="font-display text-lg font-medium text-ink">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-ink hover:text-ink-muted transition-colors duration-fast"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-xl font-ui text-ink py-3 border-b border-ink-tertiary"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-xl font-ui text-ink py-3 border-b border-ink-tertiary"
                >
                  Mon Compte
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-canvas">
          <div className="max-w-container-lg mx-auto px-6 py-24">
            <div className="flex items-center gap-4 mb-8">
              <Input
                placeholder="Rechercher un produit..."
                className="text-lg"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-ink hover:text-ink-muted transition-colors duration-fast"
                aria-label="Close search"
              >
                <X size={24} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-ink-muted text-sm">Commencez à taper pour rechercher</p>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-14 md:h-16" />
    </>
  );
}
