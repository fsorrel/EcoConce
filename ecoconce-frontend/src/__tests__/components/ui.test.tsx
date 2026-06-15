import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Badge } from '../../app/components/ui/badge';
import { Switch } from '../../app/components/ui/switch';
import { Textarea } from '../../app/components/ui/textarea';
import { Progress } from '../../app/components/ui/progress';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../app/components/ui/accordion';
import { Skeleton } from '../../app/components/ui/skeleton';
import { Separator } from '../../app/components/ui/separator';
import { ImageWithFallback } from '../../app/components/figma/ImageWithFallback';

describe('UI Components Interactive Tests', () => {
  // --- BUTTON TESTS (4) ---
  // Test 1: Button renders children
  it('Button debe renderizar el texto especificado', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  // Test 2: Button default classes
  it('Button debe tener la clase por defecto (default variant)', () => {
    render(<Button>Guardar</Button>);
    const button = screen.getByText('Guardar');
    expect(button).toHaveClass('bg-primary');
  });

  // Test 3: Button click handler
  it('Button debe disparar el evento onClick al ser clickeado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Guardar</Button>);
    const button = screen.getByText('Guardar');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test 4: Button disabled click
  it('Button no debe disparar onClick si se encuentra deshabilitado', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Guardar</Button>);
    const button = screen.getByText('Guardar');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // --- INPUT TESTS (3) ---
  // Test 5: Input placeholder
  it('Input debe renderizarse con el placeholder correspondiente', () => {
    render(<Input placeholder="Ingrese su rut" />);
    expect(screen.getByPlaceholderText('Ingrese su rut')).toBeInTheDocument();
  });

  // Test 6: Input typing (onChange)
  it('Input debe registrar texto ingresado por el usuario', () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Ingrese su rut" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('Ingrese su rut') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '12345678-9' } });
    expect(handleChange).toHaveBeenCalled();
    expect(input.value).toBe('12345678-9');
  });

  // Test 7: Input disabled
  it('Input debe respetarse la propiedad disabled', () => {
    render(<Input placeholder="Ingrese su rut" disabled />);
    const input = screen.getByPlaceholderText('Ingrese su rut');
    expect(input).toBeDisabled();
  });

  // --- BADGE TESTS (2) ---
  // Test 8: Badge content
  it('Badge debe renderizarse con su texto correspondiente', () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  // Test 9: Badge variant class
  it('Badge debe aplicar clases secundarias al pasar esa variante', () => {
    render(<Badge variant="secondary">Inactivo</Badge>);
    const badge = screen.getByText('Inactivo');
    expect(badge).toHaveClass('bg-secondary');
  });

  // --- SWITCH TESTS (3) ---
  // Test 10: Switch default state
  it('Switch debe renderizarse desmarcado por defecto', () => {
    render(<Switch data-testid="test-switch" />);
    const switchEl = screen.getByTestId('test-switch');
    expect(switchEl.getAttribute('data-state')).toBe('unchecked');
  });

  // Test 11: Switch onCheckedChange handler
  it('Switch debe cambiar de estado y llamar a onCheckedChange', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch data-testid="test-switch" onCheckedChange={handleCheckedChange} />);
    const switchEl = screen.getByTestId('test-switch');
    fireEvent.click(switchEl);
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  // Test 12: Switch disabled
  it('Switch no debe cambiar de estado si se encuentra deshabilitado', () => {
    render(<Switch data-testid="test-switch" disabled />);
    const switchEl = screen.getByTestId('test-switch');
    expect(switchEl).toBeDisabled();
  });

  // --- TEXTAREA TESTS (1) ---
  // Test 13: Textarea content and type
  it('Textarea debe recibir textos largos', () => {
    render(<Textarea placeholder="Comentarios" />);
    const textarea = screen.getByPlaceholderText('Comentarios') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Este es un comentario de prueba largo' } });
    expect(textarea.value).toBe('Este es un comentario de prueba largo');
  });

  // --- PROGRESS TESTS (2) ---
  // Test 14: Progress value
  it('Progress debe renderizarse con la propiedad de valor correcta', () => {
    render(<Progress value={45} data-testid="progress-bar" />);
    const progress = screen.getByTestId('progress-bar');
    expect(progress.getAttribute('aria-valuenow')).toBe('45');
  });

  // Test 15: Progress default value
  it('Progress debe ser indeterminado si no se le pasa valor', () => {
    render(<Progress data-testid="progress-bar" />);
    const progress = screen.getByTestId('progress-bar');
    expect(progress.getAttribute('aria-valuenow')).toBeNull();
  });

  // --- ACCORDION TESTS (2) ---
  // Test 16: Accordion collapses by default
  it('Accordion debe mantener los contenidos ocultos de forma predeterminada', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Pregunta 1</AccordionTrigger>
          <AccordionContent>Respuesta 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.queryByText('Respuesta 1')).not.toBeInTheDocument();
  });

  // Test 17: Accordion expands on trigger click
  it('Accordion debe revelar su contenido al presionar el gatillo', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Pregunta 1</AccordionTrigger>
          <AccordionContent>Respuesta 1</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByText('Pregunta 1');
    fireEvent.click(trigger);
    expect(screen.getByText('Respuesta 1')).toBeInTheDocument();
  });

  // --- SKELETON TESTS (1) ---
  // Test 18: Skeleton styling
  it('Skeleton debe aplicar las clases de animación del diseño', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  // --- SEPARATOR TESTS (1) ---
  // Test 19: Separator default orientation
  it('Separator debe tener una orientación horizontal por defecto', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator.getAttribute('data-orientation')).toBe('horizontal');
  });

  // --- IMAGE WITH FALLBACK TESTS (1) ---
  // Test 20: ImageWithFallback onError handles fallback
  it('ImageWithFallback debe mostrar el fallback si la imagen principal falla', () => {
    render(<ImageWithFallback src="invalid-img.jpg" alt="Test Img" />);
    const image = screen.getByAltElement ? screen.getByAltElement : screen.getByRole('img');
    expect(image.getAttribute('src')).toBe('invalid-img.jpg');

    // Forzamos el error de carga
    fireEvent.error(image);

    const fallbackImg = screen.getByAltText('Error loading image');
    expect(fallbackImg).toBeInTheDocument();
  });
});
