import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Badge } from '../../app/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../app/components/ui/card';
import { Switch } from '../../app/components/ui/switch';
import { Textarea } from '../../app/components/ui/textarea';
import { Progress } from '../../app/components/ui/progress';
import { Skeleton } from '../../app/components/ui/skeleton';

describe('UI Components Snapshot Tests', () => {
  // Test 1: Button default snapshot
  it('Debe coincidir con el snapshot del Button predeterminado', () => {
    const { container } = render(<Button>Guardar</Button>);
    expect(container).toMatchSnapshot();
  });

  // Test 2: Button destructive variant
  it('Debe coincidir con el snapshot del Button destructive', () => {
    const { container } = render(<Button variant="destructive">Eliminar</Button>);
    expect(container).toMatchSnapshot();
  });

  // Test 3: Button outline variant
  it('Debe coincidir con el snapshot del Button outline', () => {
    const { container } = render(<Button variant="outline">Cancelar</Button>);
    expect(container).toMatchSnapshot();
  });

  // Test 4: Button secondary variant
  it('Debe coincidir con el snapshot del Button secondary', () => {
    const { container } = render(<Button variant="secondary">Ver más</Button>);
    expect(container).toMatchSnapshot();
  });

  // Test 5: Button ghost variant
  it('Debe coincidir con el snapshot del Button ghost', () => {
    const { container } = render(<Button variant="ghost">Editar</Button>);
    expect(container).toMatchSnapshot();
  });

  // Test 6: Button link variant
  it('Debe coincidir con el snapshot del Button link', () => {
    const { container } = render(<Button variant="link">Ir a inicio</Button>);
    expect(container).toMatchSnapshot();
  });

  // Test 7: Button size sm
  it('Debe coincidir con el snapshot del Button de tamaño pequeño', () => {
    const { container } = render(<Button size="sm">Pequeño</Button>);
    expect(container).toMatchSnapshot();
  });

  // Test 8: Button size lg
  it('Debe coincidir con el snapshot del Button de tamaño grande', () => {
    const { container } = render(<Button size="lg">Grande</Button>);
    expect(container).toMatchSnapshot();
  });

  // Test 9: Input default snapshot
  it('Debe coincidir con el snapshot del Input predeterminado', () => {
    const { container } = render(<Input placeholder="Nombre completo" />);
    expect(container).toMatchSnapshot();
  });

  // Test 10: Input disabled snapshot
  it('Debe coincidir con el snapshot del Input deshabilitado', () => {
    const { container } = render(<Input placeholder="No editable" disabled />);
    expect(container).toMatchSnapshot();
  });

  // Test 11: Badge default snapshot
  it('Debe coincidir con el snapshot del Badge predeterminado', () => {
    const { container } = render(<Badge>Etiqueta</Badge>);
    expect(container).toMatchSnapshot();
  });

  // Test 12: Badge destructive snapshot
  it('Debe coincidir con el snapshot del Badge destructive', () => {
    const { container } = render(<Badge variant="destructive">Peligro</Badge>);
    expect(container).toMatchSnapshot();
  });

  // Test 13: Badge outline snapshot
  it('Debe coincidir con el snapshot del Badge outline', () => {
    const { container } = render(<Badge variant="outline">Bordeado</Badge>);
    expect(container).toMatchSnapshot();
  });

  // Test 14: Badge secondary snapshot
  it('Debe coincidir con el snapshot del Badge secondary', () => {
    const { container } = render(<Badge variant="secondary">Info</Badge>);
    expect(container).toMatchSnapshot();
  });

  // Test 15: Card structure snapshot
  it('Debe coincidir con el snapshot de una Card completa estructurada', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Título Tarjeta</CardTitle>
          <CardDescription>Descripción corta de la tarjeta</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Este es el contenido de la tarjeta para las pruebas de instantáneas.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Aceptar</Button>
        </CardFooter>
      </Card>
    );
    expect(container).toMatchSnapshot();
  });

  // Test 16: Switch checked state snapshot
  it('Debe coincidir con el snapshot del Switch activado', () => {
    const { container } = render(<Switch checked />);
    expect(container).toMatchSnapshot();
  });

  // Test 17: Switch unchecked state snapshot
  it('Debe coincidir con el snapshot del Switch desactivado', () => {
    const { container } = render(<Switch checked={false} />);
    expect(container).toMatchSnapshot();
  });

  // Test 18: Textarea snapshot
  it('Debe coincidir con el snapshot del Textarea', () => {
    const { container } = render(<Textarea placeholder="Mensaje..." rows={4} />);
    expect(container).toMatchSnapshot();
  });

  // Test 19: Progress 50% snapshot
  it('Debe coincidir con el snapshot del Progress al 50%', () => {
    const { container } = render(<Progress value={50} />);
    expect(container).toMatchSnapshot();
  });

  // Test 20: Skeleton snapshot
  it('Debe coincidir con el snapshot del Skeleton', () => {
    const { container } = render(<Skeleton className="w-[100px] h-[20px]" />);
    expect(container).toMatchSnapshot();
  });
});
