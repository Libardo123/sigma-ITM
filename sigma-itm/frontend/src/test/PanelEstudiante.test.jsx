/**
 * PanelEstudiante.test.jsx — SIGMA ITM
 * Pruebas del bloque 12: verificar que si la API falla, el componente
 * muestra un mensaje de error y un botón de reintentar (no queda cargando).
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock del cliente API antes de importar el componente
vi.mock("../api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock de AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    usuario: { id: 1, username: "est1", rol: "ESTUDIANTE" },
  }),
}));

import api from "../api/client";
import PanelEstudiante from "../pages/PanelEstudiante";

describe("PanelEstudiante — manejo de errores de carga (Bloque 12)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra mensaje de error cuando la API de postulaciones falla", async () => {
    // Simular fallo de red en ambas llamadas
    api.get.mockRejectedValue(new Error("Network Error"));

    render(<PanelEstudiante />);

    // Esperar a que el error aparezca (no debe quedarse en "Cargando...")
    await waitFor(() => {
      expect(
        screen.getByRole("alert")
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/cargando tu proceso/i)
    ).not.toBeInTheDocument();
  });

  it("muestra botón de Reintentar cuando la carga falla", async () => {
    api.get.mockRejectedValue(new Error("Network Error"));

    render(<PanelEstudiante />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /reintentar/i })
      ).toBeInTheDocument();
    });
  });

  it("llama a la API de nuevo al hacer clic en Reintentar", async () => {
    const user = userEvent.setup();

    // Primera llamada falla, segunda tiene éxito
    api.get
      .mockRejectedValueOnce(new Error("Network Error"))
      .mockRejectedValueOnce(new Error("Network Error"))
      .mockResolvedValueOnce({ data: [] }) // segunda vez: sin postulaciones
      .mockResolvedValueOnce({ data: [] }); // modalidades

    render(<PanelEstudiante />);

    const botonReintentar = await screen.findByRole("button", {
      name: /reintentar/i,
    });
    await user.click(botonReintentar);

    // Debería haber intentado al menos 2 veces
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(4); // 2 intentos × 2 endpoints
    });
  });

  it("muestra el formulario de postulación cuando no hay error y sin proceso activo", async () => {
    api.get
      .mockResolvedValueOnce({ data: [] })        // postulaciones vacías
      .mockResolvedValueOnce({ data: [] });        // modalidades vacías

    render(<PanelEstudiante />);

    await waitFor(() => {
      expect(
        screen.getByText(/selecciona tu modalidad de grado/i)
      ).toBeInTheDocument();
    });
  });

  it("muestra el botón de Subsanar Corrección y permite radicar la subsanación con soporte (Bloque 18)", async () => {
    const user = userEvent.setup();

    api.get
      .mockResolvedValueOnce({
        data: [
          {
            id: "proc-123",
            estudiante: 1,
            modalidad_nombre: "Trabajo de Grado",
            titulo_proyecto: "Proyecto AI",
            estado: "POSTULACION",
            estado_display: "Postulación",
            requiere_correccion: true,
            observacion_correccion: "Ajustar la bibliografía.",
          },
        ],
      })
      .mockResolvedValueOnce({ data: [] }) // modalidades
      .mockResolvedValueOnce({ data: [] }); // historial

    api.post.mockResolvedValueOnce({ data: { success: true } });

    render(<PanelEstudiante />);

    const botonAbrir = await screen.findByRole("button", {
      name: /subsanar corrección/i,
    });
    expect(botonAbrir).toBeInTheDocument();

    await user.click(botonAbrir);

    // Diligenciar modal de subsanación
    const inputMensaje = screen.getByLabelText(/explicación de las correcciones/i);
    fireEvent.change(inputMensaje, {
      target: { value: "Se ajustaron las referencias bibliográficas según lo solicitado." },
    });

    const inputFile = screen.getByLabelText(/documento corregido/i);
    const fakeFile = new File(["contenido de prueba"], "correcciones.pdf", { type: "application/pdf" });
    fireEvent.change(inputFile, { target: { files: [fakeFile] } });

    const form = screen.getByRole("dialog").querySelector("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/postulaciones/proc-123/subsanar_correccion/",
        expect.any(FormData),
        expect.anything()
      );
    });
  });

  it("renderiza los documentos ya subidos y los requisitos faltantes (Bloque 19)", async () => {
    api.get
      .mockResolvedValueOnce({
        data: [
          {
            id: "proc-999",
            estudiante: 1,
            modalidad_nombre: "Trabajo de Grado",
            titulo_proyecto: "Proyecto Blockchain",
            estado: "POSTULACION",
            estado_display: "Postulación",
            requiere_correccion: false,
            documentos: [
              {
                id: 501,
                nombre: "Anteproyecto v1",
                archivo: "/media/documentos/anteproyecto.pdf",
                subido_en: "2026-09-20T12:00:00Z",
              },
            ],
          },
        ],
      })
      .mockResolvedValueOnce({ data: [] }) // modalidades
      .mockResolvedValueOnce({
        // validar_documentos
        data: {
          es_valido: false,
          modalidad: "Trabajo de Grado",
          documentos_faltantes: ["Certificado de paz y salvo académico"],
        },
      })
      .mockResolvedValueOnce({ data: [] }); // historial

    render(<PanelEstudiante />);

    // Verificar documentos ya subidos
    expect(await screen.findByText(/Anteproyecto v1/i)).toBeInTheDocument();
    const enlaceDescarga = screen.getByRole("link", { name: /descargar o ver documento anteproyecto v1/i });
    expect(enlaceDescarga).toBeInTheDocument();
    expect(enlaceDescarga.getAttribute("href")).toContain("/media/documentos/anteproyecto.pdf");

    // Verificar alerta de documentos faltantes
    expect(
      await screen.findByText(/Aún te falta subir los siguientes documentos obligatorios/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Certificado de paz y salvo académico/i)
    ).toBeInTheDocument();
  });

  it("no muestra el botón de Descargar Certificado si el proceso no está FINALIZADO", async () => {
    api.get
      .mockResolvedValueOnce({
        data: [
          {
            id: "proc-111",
            estudiante: 1,
            modalidad_nombre: "Trabajo de Grado",
            titulo_proyecto: "Proyecto Activo",
            estado: "EN_PROCESO",
            estado_display: "En Proceso",
            requiere_correccion: false,
          },
        ],
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(<PanelEstudiante />);

    await waitFor(() => {
      expect(screen.getByText("Proyecto Activo")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /descargar certificado/i })
    ).not.toBeInTheDocument();
  });

  it("muestra el botón y permite Descargar Certificado cuando el proceso está FINALIZADO (Bloque 20)", async () => {
    const user = userEvent.setup();
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    api.get
      .mockResolvedValueOnce({
        data: [
          {
            id: "proc-fin",
            estudiante: 1,
            modalidad_nombre: "Trabajo de Grado",
            titulo_proyecto: "Proyecto Culminado",
            estado: "FINALIZADO",
            estado_display: "Finalizado",
            requiere_correccion: false,
          },
        ],
      })
      .mockResolvedValueOnce({ data: [] }) // modalidades
      .mockResolvedValueOnce({ data: [] }) // validar_documentos
      .mockResolvedValueOnce({ data: [] }); // historial

    // Mock de la petición GET de descarga del certificado
    api.get.mockImplementation((url, config) => {
      if (url === "/postulaciones/proc-fin/certificado/") {
        return Promise.resolve({
          data: new Blob(["%PDF-1.4 mock pdf"], { type: "application/pdf" }),
          headers: {
            "content-disposition": 'attachment; filename="certificado_final.pdf"',
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<PanelEstudiante />);

    const botonDescarga = await screen.findByRole("button", {
      name: /descargar certificado/i,
    });
    expect(botonDescarga).toBeInTheDocument();
    expect(
      screen.getByText(/¡Felicitaciones! Has culminado tu Opción de Grado/i)
    ).toBeInTheDocument();

    await user.click(botonDescarga);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/postulaciones/proc-fin/certificado/",
        { responseType: "blob" }
      );
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });

    clickSpy.mockRestore();
  });

  it("muestra alerta de error si falla la descarga del certificado", async () => {
    const user = userEvent.setup();

    api.get
      .mockResolvedValueOnce({
        data: [
          {
            id: "proc-fin-err",
            estudiante: 1,
            modalidad_nombre: "Trabajo de Grado",
            titulo_proyecto: "Proyecto Culminado",
            estado: "FINALIZADO",
            estado_display: "Finalizado",
            requiere_correccion: false,
          },
        ],
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    // Mock de fallo en la descarga
    api.get.mockImplementation((url) => {
      if (url === "/postulaciones/proc-fin-err/certificado/") {
        return Promise.reject({
          response: {
            data: { detail: "El servidor no pudo generar el PDF temporalmente." },
          },
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<PanelEstudiante />);

    const botonDescarga = await screen.findByRole("button", {
      name: /descargar certificado/i,
    });

    await user.click(botonDescarga);

    expect(
      await screen.findByText(/El servidor no pudo generar el PDF temporalmente./i)
    ).toBeInTheDocument();
  });
});



