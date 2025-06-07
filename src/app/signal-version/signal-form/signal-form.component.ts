import {Component, computed, effect, inject, Signal} from '@angular/core';
import {UserService} from '../../service/userService';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {User} from '../../model/user';
import {toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, filter, map, startWith} from 'rxjs';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-signal-form',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './signal-form.component.html',
  styleUrl: './signal-form.component.css'
})
export class SignalFormComponent {

  private userService = inject(UserService);

  protected userForm: FormGroup;

  protected users: Signal<User[] | undefined>;

  protected userNameStatus: Signal<string>;
  protected emailStatus: Signal<string>;
  protected formFieldStatus: Signal<string | undefined>;

  protected isEmailAddressTaken: Signal<boolean>;
  protected isUserNameTaken: Signal<boolean | undefined>;
  protected canSubmit: Signal<boolean>;

  protected userNameSignal: Signal<string>;
  protected emailAddressSignal: Signal<string>;

  protected userSearchResults: User[] | undefined;

  constructor(private formBuilder: FormBuilder) {
    this.users = toSignal(this.userService.getUsers());

    this.userForm = this.formBuilder.group({
        username: ["", [Validators.required, Validators.minLength(3)]],
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        emailAddress: ["", [Validators.required, Validators.email]],
        address: ["", Validators.required],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }
    );

    this.userNameSignal = toSignal(
      this.userForm.controls['username'].valueChanges.pipe(
        debounceTime(300),
        filter(value => value.length > 2),
        startWith(this.userForm.controls['username'].value)
      )
    );

    this.emailAddressSignal = toSignal(
      this.userForm.controls['emailAddress'].valueChanges.pipe(
        debounceTime(300),
        filter(value => value.includes('@')),
        startWith(this.userForm.controls['emailAddress'].value)
      )
    );

    this.isUserNameTaken = computed(() => this.isNameTaken(this.userNameSignal()));
    this.isEmailAddressTaken = computed(() => this.isEmailTaken(this.emailAddressSignal()));

    this.formFieldStatus = toSignal(
      this.userForm.statusChanges.pipe(
        startWith(this.userForm.status),
        map(status => status ?? '')
      )
    );

    this.userNameStatus = computed(() => {
      return this.isUserNameTaken() ? 'Name existiert bereits' : 'ok'
    });

    this.emailStatus = computed(() => {
      return this.isEmailAddressTaken() ? 'Email existiert bereits' : 'ok'
    });

    this.canSubmit = computed(() => {
      return this.formFieldStatus() === 'VALID' && !this.isUserNameTaken() && !this.isEmailAddressTaken()
    })

    effect(() => {
      this.userSearchResults = this.searchUser(this.userNameSignal());
    });

  };

  onSubmit() {
    if (this.userForm.valid) {
      this.userService.addUser(this.userForm)
    } else {
      alert('Bitte alle Felder korrekt ausfüllen.');
    }
  };

  isNameTaken(name: string): boolean {
    return this.users()?.some(
      user => user.userName.toLowerCase() === name.toLowerCase()
    ) ?? false;
  }

  isEmailTaken(address: string) {
    return this.users()?.some(
      user => user.eMailAddress.toLowerCase() === address.toLowerCase()
    ) ?? false;
  }

  searchUser(name: string): User[] | undefined {
    return this.users()?.filter(
      user => user.userName.toLowerCase() === name.toLowerCase()
    );
  }
}
