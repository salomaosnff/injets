var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "reflect-metadata";
import { Module } from "./decorators/module.decorator";
import { Inject } from "./decorators/inject.decorator";
import { ModuleRef } from "./module";
import { Provider } from "./decorators";
let ConfigModule = class ConfigModule {
    static forRoot(config) {
        const providers = [
            {
                provide: "CONFIG",
                useFactory: () => __awaiter(this, void 0, void 0, function* () { return (Object.assign(Object.assign({}, config), { isFactory: false })); }),
            },
            {
                provide: "CONFIG_FACTORY",
                useFactory: () => __awaiter(this, void 0, void 0, function* () { return (Object.assign(Object.assign({}, config), { isFactory: true })); }),
            },
        ];
        return {
            module: this,
            providers,
            exports: providers,
        };
    }
};
ConfigModule = __decorate([
    Module({})
], ConfigModule);
let MyProvider = class MyProvider {
    constructor(config2) {
        console.log("My Provider!", this.config, config2);
    }
};
__decorate([
    Inject("CONFIG_FACTORY"),
    __metadata("design:type", Object)
], MyProvider.prototype, "config", void 0);
MyProvider = __decorate([
    Provider(),
    __param(0, Inject("CONFIG")),
    __metadata("design:paramtypes", [Object])
], MyProvider);
let AppModule = class AppModule {
    onModuleInit() {
        console.log("Module ready!", this.config);
    }
};
__decorate([
    Inject("CONFIG_FACTORY"),
    __metadata("design:type", Object)
], AppModule.prototype, "config", void 0);
AppModule = __decorate([
    Module({
        imports: [ConfigModule.forRoot({ username: "root", password: "123" })],
        providers: [MyProvider],
    })
], AppModule);
ModuleRef.create(AppModule).then((app) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Ready!", yield app.get(MyProvider));
}));
//# sourceMappingURL=test.js.map