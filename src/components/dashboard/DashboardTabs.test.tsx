import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardTabs } from "./DashboardTabs";

describe("DashboardTabs", () => {
  const tabs = [
    { id: "search", label: "Buscar" },
    { id: "profile", label: "Perfil" },
    { id: "history", label: "Historial" },
  ];

  it("renders all tabs with labels", () => {
    render(
      <DashboardTabs tabs={tabs} active="search" onChange={vi.fn()}>
        <div />
      </DashboardTabs>,
    );

    expect(screen.getByText("Buscar")).toBeDefined();
    expect(screen.getByText("Perfil")).toBeDefined();
    expect(screen.getByText("Historial")).toBeDefined();
  });

  it("marks active tab with aria-selected", () => {
    render(
      <DashboardTabs tabs={tabs} active="profile" onChange={vi.fn()}>
        <div />
      </DashboardTabs>,
    );

    const profileTab = screen.getByText("Perfil").closest("button");
    const searchTab = screen.getByText("Buscar").closest("button");

    expect(profileTab?.getAttribute("aria-selected")).toBe("true");
    expect(searchTab?.getAttribute("aria-selected")).toBe("false");
  });

  it("calls onChange when tab clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DashboardTabs tabs={tabs} active="search" onChange={handleChange}>
        <div />
      </DashboardTabs>,
    );

    await user.click(screen.getByText("Perfil"));
    expect(handleChange).toHaveBeenCalledWith("profile");
  });

  it("renders badges when provided", () => {
    const tabsWithBadge = [
      ...tabs,
      { id: "notifications", label: "Notifs", badge: 3 },
    ];

    render(
      <DashboardTabs tabs={tabsWithBadge} active="search" onChange={vi.fn()}>
        <div />
      </DashboardTabs>,
    );

    const notifTab = screen.getByText("Notifs").closest("button");
    expect(notifTab).toBeDefined();
    expect(notifTab?.textContent).toContain("3");
  });

  it("navigates with ArrowRight keyboard", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DashboardTabs tabs={tabs} active="search" onChange={handleChange}>
        <div />
      </DashboardTabs>,
    );

    const searchTab = screen.getByText("Buscar").closest("button")!;
    searchTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(handleChange).toHaveBeenCalledWith("profile");
  });

  it("navigates with ArrowLeft keyboard", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DashboardTabs tabs={tabs} active="history" onChange={handleChange}>
        <div />
      </DashboardTabs>,
    );

    const historyTab = screen.getByText("Historial").closest("button")!;
    historyTab.focus();
    await user.keyboard("{ArrowLeft}");

    expect(handleChange).toHaveBeenCalledWith("profile");
  });

  it("wraps around with ArrowRight from last to first", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DashboardTabs tabs={tabs} active="history" onChange={handleChange}>
        <div />
      </DashboardTabs>,
    );

    const historyTab = screen.getByText("Historial").closest("button")!;
    historyTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(handleChange).toHaveBeenCalledWith("search");
  });

  it("uses role tablist and tab attributes", () => {
    render(
      <DashboardTabs tabs={tabs} active="search" onChange={vi.fn()}>
        <div />
      </DashboardTabs>,
    );

    expect(screen.getByRole("tablist")).toBeDefined();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
  });

  it("sets aria-controls on each tab", () => {
    render(
      <DashboardTabs tabs={tabs} active="search" onChange={vi.fn()}>
        <div />
      </DashboardTabs>,
    );

    const searchTab = screen.getByText("Buscar").closest("button")!;
    expect(searchTab.getAttribute("aria-controls")).toBe("panel-search");
  });
});
