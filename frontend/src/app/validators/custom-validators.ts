import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * Valida se o campo é um email válido ou um CNPJ válido
   */
  static emailOuCnpj(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    // Regex de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Valida como CNPJ (com dígitos verificadores)
    if (/^\d{14}$/.test(value)) {
      return CustomValidators.validarCNPJ(value) ? null : { cnpjInvalido: true };
    }

    // Valida como email
    if (emailRegex.test(value)) {
      return null;
    }

    return { emailOuCnpjInvalido: true };
  }

  /**
   * Valida CNPJ com dígitos verificadores
   */
  static cnpj(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    // Remove caracteres não numéricos
    const cnpj = value.replace(/\D/g, '');

    if (cnpj.length !== 14) {
      return { cnpjInvalido: true };
    }

    return CustomValidators.validarCNPJ(cnpj) ? null : { cnpjInvalido: true };
  }

  /**
   * Valida senha forte (mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais)
   */
  static senhaForte(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const temMaiuscula = /[A-Z]/.test(value);
    const temMinuscula = /[a-z]/.test(value);
    const temNumero = /[0-9]/.test(value);
    const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const temTamanhoMinimo = value.length >= 8;

    const errors: ValidationErrors = {};

    if (!temMaiuscula) {
      errors['semMaiuscula'] = true;
    }
    if (!temMinuscula) {
      errors['semMinuscula'] = true;
    }
    if (!temNumero) {
      errors['semNumero'] = true;
    }
    if (!temEspecial) {
      errors['semEspecial'] = true;
    }
    if (!temTamanhoMinimo) {
      errors['tamanhoMinimo'] = true;
    }

    return Object.keys(errors).length > 0 ? { senhaFraca: errors } : null;
  }

  /**
   * Validador para confirmar se dois campos são iguais
   */
  static camposIguais(campo1: string, campo2: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor1 = control.get(campo1)?.value;
      const valor2 = control.get(campo2)?.value;

      return valor1 === valor2 ? null : { camposNaoConferem: true };
    };
  }

  /**
   * Algoritmo de validação de CNPJ
   */
  private static validarCNPJ(cnpj: string): boolean {
    // CNPJs conhecidos como inválidos
    const cnpjsInvalidos = [
      '00000000000000',
      '11111111111111',
      '22222222222222',
      '33333333333333',
      '44444444444444',
      '55555555555555',
      '66666666666666',
      '77777777777777',
      '88888888888888',
      '99999999999999',
    ];

    if (cnpjsInvalidos.includes(cnpj)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
      return false;
    }

    // Validação do segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) {
      return false;
    }

    return true;
  }
}
