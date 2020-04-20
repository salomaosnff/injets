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
import { Provider } from "./decorators";
import { ModuleRef } from "./module";
let GlobalModule = class GlobalModule {
};
GlobalModule = __decorate([
    Module({
        global: true,
        providers: [{ provide: 'NUMBER', useValue: 5 }]
    })
], GlobalModule);
let Provider1 = class Provider1 {
    constructor(n) {
        console.log(n);
    }
};
Provider1 = __decorate([
    Provider(),
    __param(0, Inject('NUMBER')),
    __metadata("design:paramtypes", [Number])
], Provider1);
let NoGlobalModule = class NoGlobalModule {
};
NoGlobalModule = __decorate([
    Module({
        providers: [Provider1]
    })
], NoGlobalModule);
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [GlobalModule, NoGlobalModule]
    })
], AppModule);
export { AppModule };
ModuleRef.create(AppModule).then((mod) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield mod.getModule(NoGlobalModule).get(Provider1);
    console.log(p);
}));
//# sourceMappingURL=foo.js.map