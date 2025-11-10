import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { PrimaryButton } from '../../_components/primary-button/primary-button';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { LoggerService } from '../../services/logger.service';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PrimaryButton],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnDestroy {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private logger: LoggerService
  ) {
    this.registerForm = this.fb.group(
      {
        nomeFantasia: ['', [Validators.required, Validators.maxLength(150)]],
        razaoSocial: [''],
        cnpj: ['', [Validators.required, CustomValidators.cnpj]],
        email: ['', [Validators.required, Validators.email]],
        confirmarEmail: ['', [Validators.required, Validators.email]],
        senha: ['', [Validators.required, Validators.minLength(8)]],
        confirmarSenha: ['', [Validators.required]],
      },
      {
        validators: [
          CustomValidators.camposIguais('email', 'confirmarEmail'),
          CustomValidators.camposIguais('senha', 'confirmarSenha'),
        ],
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { nomeFantasia, email, senha, cnpj, razaoSocial } = this.registerForm.value;

    this.authService
      .register({
        nome: nomeFantasia,
        email,
        senha,
        cnpj,
        razaoSocial: razaoSocial || undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.logger.log('Cadastro realizado com sucesso, redirecionando para login');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = this.errorHandler.handleAuthError(err);
          this.logger.error('Erro no cadastro', err);
        },
      });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Retorna mensagens de erro para os campos
   */
  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);

    if (control?.hasError('required')) {
      return 'Campo obrigatório.';
    }
    if (control?.hasError('email')) {
      return 'Digite um e-mail válido.';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo de ${minLength} caracteres.`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo de ${maxLength} caracteres.`;
    }
    if (control?.hasError('cnpjInvalido')) {
      return 'CNPJ inválido. Verifique os dígitos.';
    }

    return '';
  }

  /**
   * Verifica se os emails conferem
   */
  hasEmailMismatch(): boolean {
    return (
      this.registerForm.hasError('camposNaoConferem') &&
      this.registerForm.get('confirmarEmail')?.touched === true
    );
  }

  /**
   * Verifica se as senhas conferem
   */
  hasPasswordMismatch(): boolean {
    return (
      this.registerForm.hasError('camposNaoConferem') &&
      this.registerForm.get('confirmarSenha')?.touched === true
    );
  }
}
