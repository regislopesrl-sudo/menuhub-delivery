import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { PrismaService } from './database/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AddonsModule } from './modules/addons/addons.module';
import { CombosModule } from './modules/combos/combos.module';
import { ProductsModule } from './modules/products/products.module';
import { TablesModule } from './modules/tables/tables.module';
import { CommandsModule } from './modules/commands/commands.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { WaitlistsModule } from './modules/waitlists/waitlists.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StockModule } from './modules/stock/stock.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { PurchasingModule } from './modules/purchasing/purchasing.module';
import { FinancialModule } from './modules/financial/financial.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ProductionModule } from './modules/production/production.module';
import { KdsModule } from './modules/kds/kds.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { BotModule } from './modules/bot/bot.module';
import { OrdersCoreModule } from './modules/orders-core/orders-core.module';
import { MenuModule } from './modules/menu/menu.module';
import { DeliveryFeesModule } from './modules/delivery-fees/delivery-fees.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { DeliveryAreasModule } from './modules/delivery-areas/delivery-areas.module';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CompaniesModule,
    SettingsModule,
    CategoriesModule,
    AddonsModule,
    CombosModule,
    ProductsModule,
    TablesModule,
    CommandsModule,
    ReservationsModule,
    WaitlistsModule,
    CustomersModule,
    OrdersModule,
    StockModule,
    SuppliersModule,
    PurchasingModule,
    FinancialModule,
    CouponsModule,
    ProductionModule,
    KdsModule,
    DeliveryModule,
    DeliveryAreasModule,
    AddressesModule,
    WhatsappModule,
    BotModule,
    OrdersCoreModule,
    MenuModule,
    DeliveryFeesModule,
    LoyaltyModule,
    ReviewsModule,
    ReportsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
