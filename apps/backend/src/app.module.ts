import { Module } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AddonsModule } from './modules/addons/addons.module';
import { AuthModule } from './modules/auth/auth.module';
import { BotModule } from './modules/bot/bot.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CommandsModule } from './modules/commands/commands.module';
import { CombosModule } from './modules/combos/combos.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DeliveryAreasModule } from './modules/delivery-areas/delivery-areas.module';
import { DeliveryFeesModule } from './modules/delivery-fees/delivery-fees.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { FinancialModule } from './modules/financial/financial.module';
import { HealthModule } from './health/health.module';
import { KdsModule } from './modules/kds/kds.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrdersCoreModule } from './modules/orders-core/orders-core.module';
import { ProductionModule } from './modules/production/production.module';
import { PurchasingModule } from './modules/purchasing/purchasing.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RolesModule } from './modules/roles/roles.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StockModule } from './modules/stock/stock.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { TablesModule } from './modules/tables/tables.module';
import { UsersModule } from './modules/users/users.module';
import { WaitlistsModule } from './modules/waitlists/waitlists.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    AddonsModule,
    AddressesModule,
    AuthModule,
    BotModule,
    CategoriesModule,
    CommandsModule,
    CombosModule,
    CompaniesModule,
    CouponsModule,
    CustomersModule,
    DeliveryAreasModule,
    DeliveryFeesModule,
    DeliveryModule,
    FinancialModule,
    HealthModule,
    KdsModule,
    LoyaltyModule,
    MenuModule,
    OrdersCoreModule,
    OrdersModule,
    ProductionModule,
    PurchasingModule,
    ReportsModule,
    ReservationsModule,
    ReviewsModule,
    RolesModule,
    SettingsModule,
    StockModule,
    SuppliersModule,
    TablesModule,
    UsersModule,
    WaitlistsModule,
    WhatsappModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
