import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TaxCalculatorLayout } from "./TaxCalculatorLayout";
import type { TaxCalculatorResult } from "@/lib/types/tax";

interface MockWsInstance {
  onmessage: ((e: { data: string }) => void) | null;
  onerror: (() => void) | null;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  readyState: number;
}

let mockWs!: MockWsInstance;

const MockWebSocket = vi.fn(function () {
  return mockWs;
});
Object.defineProperty(MockWebSocket, "OPEN", { value: 1 });

const mockResult: TaxCalculatorResult = {
  grossIncome: 50000,
  netIncome: 35000,
  totalTax: 15000,
  lineItems: [],
};

describe("TaxCalculatorLayout", () => {
  beforeEach(() => {
    mockWs = {
      onmessage: null,
      onerror: null,
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1,
    };
    vi.useFakeTimers();
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  test("sends WebSocket message after 500ms debounce for valid income", () => {
    render(<TaxCalculatorLayout />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "50000" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ incomeAmount: 50000, period: "annual", country: "LT" }),
    );
  });

  test("does not send WebSocket message for zero income", () => {
    render(<TaxCalculatorLayout />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "0" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockWs.send).not.toHaveBeenCalled();
  });

  test("only sends once when user types quickly (debounce)", () => {
    render(<TaxCalculatorLayout />);
    const input = screen.getByLabelText(/enter your income/i);

    fireEvent.change(input, { target: { value: "1" } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.change(input, { target: { value: "10" } });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.change(input, { target: { value: "100" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockWs.send).toHaveBeenCalledTimes(1);
    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ incomeAmount: 100, period: "annual", country: "LT" }),
    );
  });

  test("displays results when a valid WebSocket response arrives", () => {
    render(<TaxCalculatorLayout />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "50000" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      mockWs.onmessage!({ data: JSON.stringify(mockResult) });
    });

    expect(screen.getByText(/based on your income/i)).toBeInTheDocument();
    expect(screen.getByText("€35000.00")).toBeInTheDocument();
    expect(screen.getByText("€15000.00")).toBeInTheDocument();
  });

  test("shows error message when response contains an error flag", () => {
    render(<TaxCalculatorLayout />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "50000" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      mockWs.onmessage!({ data: JSON.stringify({ error: "server error" }) });
    });

    expect(screen.getByText(/calculation failed/i)).toBeInTheDocument();
  });

  test("shows error message on malformed JSON response", () => {
    render(<TaxCalculatorLayout />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "50000" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      mockWs.onmessage!({ data: "not {{ valid json" });
    });

    expect(screen.getByText(/calculation failed/i)).toBeInTheDocument();
  });

  test("clears results when income is cleared after a result", () => {
    render(<TaxCalculatorLayout />);
    const input = screen.getByLabelText(/enter your income/i);

    fireEvent.change(input, { target: { value: "50000" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      mockWs.onmessage!({ data: JSON.stringify(mockResult) });
    });
    expect(screen.getByText(/based on your income/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });

    expect(screen.getByText(/results appear here/i)).toBeInTheDocument();
  });

  test("shows loading text only after 500ms loading delay", () => {
    render(<TaxCalculatorLayout />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "50000" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    }); // debounce fires - isCalculating=true, loading timer starts

    expect(screen.queryByText(/processing your input/i)).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    }); // loading timer fires - showLoading=true

    expect(screen.getByText(/processing your input/i)).toBeInTheDocument();
  });

  test("does not show loading text when response arrives before the delay", () => {
    render(<TaxCalculatorLayout />);

    fireEvent.change(screen.getByLabelText(/enter your income/i), {
      target: { value: "50000" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    }); // debounce fires
    act(() => {
      mockWs.onmessage!({ data: JSON.stringify(mockResult) });
    }); // fast response

    act(() => {
      vi.advanceTimersByTime(500);
    }); // loading timer was cancelled - nothing fires

    expect(screen.queryByText(/processing your input/i)).not.toBeInTheDocument();
  });

  test("closes WebSocket connection on unmount", () => {
    const { unmount } = render(<TaxCalculatorLayout />);
    unmount();

    expect(mockWs.close).toHaveBeenCalled();
  });
});
