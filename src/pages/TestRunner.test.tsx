// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestRunner } from './TestRunner';

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), finish: vi.fn() }));
const test = {
  id: 'test-example', titulo: 'Example',
  preguntas: [1, 2, 3].map(index => ({
    id: `q${index}`, enunciado: `Question ${index}`, tipo: 'unica' as const,
    bloque: 'Theory', explicacion: `Explanation ${index}`,
    opciones: [{ id: 'a', texto: `Answer ${index} A` }, { id: 'b', texto: `Answer ${index} B` }],
    respuestaCorrecta: ['a'],
  })),
};
let config = { mostrarResultadosInmediatos: true, modoBloques: true, bloquesSeleccionados: [1] };

vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('../context/AppContext', () => ({
  useApp: () => {
    const [answers, setAnswers] = React.useState<Record<string, string[]>>({});
    return {
      currentTest: test, testConfig: config, userAnswers: answers,
      submitAnswer: (id: string, values: string[]) => setAnswers(prev => ({ ...prev, [id]: values })),
      finishTest: mocks.finish,
    };
  },
}));

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  config = { mostrarResultadosInmediatos: true, modoBloques: true, bloquesSeleccionados: [1] };
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('Immediate feedback navigation', () => {
  it.each(['A', 'B'])('shows feedback for answer %s, then advances after exactly two seconds', answer => {
    render(<TestRunner />);
    fireEvent.click(screen.getByRole('button', { name: `Answer 1 ${answer}` }));
    expect(screen.getByText('Explanation 1')).toBeTruthy();
    advance(1999);
    expect(screen.getByText('Question 1')).toBeTruthy();
    advance(1);
    expect(screen.getByText('Question 2')).toBeTruthy();
    advance(4000);
    expect(screen.getByText('Question 2')).toBeTruthy();
  });

  it('does not advance automatically when immediate feedback is disabled', () => {
    config = { ...config, mostrarResultadosInmediatos: false };
    render(<TestRunner />);
    fireEvent.click(screen.getByRole('button', { name: 'Answer 1 A' }));
    advance(3000);
    expect(screen.getByText('Question 1')).toBeTruthy();
    expect(screen.queryByText('Explanation 1')).toBeNull();
  });

  it('cancels pending advancement after manual navigation and allows reviewing previous answers', () => {
    render(<TestRunner />);
    fireEvent.click(screen.getByRole('button', { name: 'Answer 1 A' }));
    advance(1000);
    fireEvent.click(screen.getByRole('button', { name: /Siguiente/ }));
    advance(2000);
    expect(screen.getByText('Question 2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Anterior/ }));
    advance(3000);
    expect(screen.getByText('Question 1')).toBeTruthy();
  });

  it('leaves the final answer visible until the user finishes', () => {
    render(<TestRunner />);
    for (const index of [1, 2, 3]) {
      fireEvent.click(screen.getByRole('button', { name: `Answer ${index} A` }));
      advance(2000);
    }
    expect(screen.getByText('Question 3')).toBeTruthy();
    expect(mocks.finish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar' }));
    expect(mocks.finish).toHaveBeenCalledTimes(1);
    expect(mocks.navigate).toHaveBeenCalledWith('/results');
  });

  it('clears the timer when the runner unmounts', () => {
    const view = render(<TestRunner />);
    fireEvent.click(screen.getByRole('button', { name: 'Answer 1 A' }));
    expect(vi.getTimerCount()).toBe(1);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
