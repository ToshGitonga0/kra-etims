import type { HttpClient } from "../client/HttpClient.js";
import { InitializationService } from "./services/initialization.js";
import { CodeService, CustomerService, NoticeService } from "./services/codes.js";
import { ItemService } from "./services/items.js";
import { BranchService } from "./services/branches.js";
import { ImportItemService } from "./services/importItems.js";
import { SalesService } from "./services/sales.js";
import { PurchaseService } from "./services/purchases.js";
import { StockService } from "./services/stock.js";

export * from "./endpoints.js";
export * from "./codes.js";
export * from "./types.js";
export * from "./services/initialization.js";
export * from "./services/codes.js";
export * from "./services/items.js";
export * from "./services/branches.js";
export * from "./services/importItems.js";
export * from "./services/sales.js";
export * from "./services/purchases.js";
export * from "./services/stock.js";

/**
 * Groups every verified OSCU domain service behind one object, e.g.
 * `client.oscu.sales.save(...)`. Constructed internally by
 * {@link import("../client/EtimsClient.js").EtimsClient} — you should not
 * normally construct this directly.
 */
export class OscuDomain {
  public readonly init: InitializationService;
  public readonly codes: CodeService;
  public readonly notices: NoticeService;
  public readonly customers: CustomerService;
  public readonly items: ItemService;
  public readonly branches: BranchService;
  public readonly importItems: ImportItemService;
  public readonly sales: SalesService;
  public readonly purchases: PurchaseService;
  public readonly stock: StockService;

  constructor(http: HttpClient) {
    this.init = new InitializationService(http);
    this.codes = new CodeService(http);
    this.notices = new NoticeService(http);
    this.customers = new CustomerService(http);
    this.items = new ItemService(http);
    this.branches = new BranchService(http);
    this.importItems = new ImportItemService(http);
    this.sales = new SalesService(http);
    this.purchases = new PurchaseService(http);
    this.stock = new StockService(http);
  }
}
