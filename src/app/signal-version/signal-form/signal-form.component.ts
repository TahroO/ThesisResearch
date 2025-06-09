import {Component, computed, effect, inject, signal, Signal} from '@angular/core';
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
/**
 * Represents a signal version of a reactive registration form with extended validation
 */
export class SignalFormComponent {
  private userService = inject(UserService);
  protected userForm: FormGroup;
  // existing collection of users
  protected users: Signal<User[] | undefined>;
  // reactive form state handling
  protected userNameStatus: Signal<string>;
  protected emailStatus: Signal<string>;
  protected formFieldStatus: Signal<string | undefined>;
  // reactive form field access values for change detection
  // signal forms are not available yet in angular v19
  protected userNameSignal: Signal<string>;
  protected emailAddressSignal: Signal<string>;
  // evaluation methods
  protected isEmailAddressTaken: Signal<boolean>;
  protected isUserNameTaken: Signal<boolean | undefined>;
  protected canSubmit: Signal<boolean>;
  // direct user feedback on duplicated usernames
  protected userSearchResults: User[] | undefined;
  // evaluation counter
  protected counter = signal<number>(0);


  constructor(private formBuilder: FormBuilder) {
    // initialize user collection via http-request - lazy observable to signal for synchronous interaction
    this.users = toSignal(this.userService.getUsers());
    // initialize form fields
    this.userForm = this.formBuilder.group({
        username: ["", [Validators.required, Validators.minLength(3)]],
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        emailAddress: ["", [Validators.required, Validators.email]],
        address: ["", Validators.required],
        phoneNumber: ["", [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }
    );
    // initialize reactive form field access values for change detection
    // signal forms are not available yet in angular v19
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

    // reactive field evaluation of user input
    this.isUserNameTaken = computed(() => this.isNameTaken(this.userNameSignal()));
    this.isEmailAddressTaken = computed(() => this.isEmailTaken(this.emailAddressSignal()));
    this.formFieldStatus = toSignal(
      this.userForm.statusChanges.pipe(
        startWith(this.userForm.status),
        map(status => status ?? '')
      )
    );
    // reactive visual user feedback according to state
    this.userNameStatus = computed(() => {
      return this.isUserNameTaken() ? 'Name existiert bereits' : 'ok'
    });
    this.emailStatus = computed(() => {
      return this.isEmailAddressTaken() ? 'Email existiert bereits' : 'ok'
    });
    // search results signal version
    effect(() => {
      this.userSearchResults = this.searchUsers(this.userNameSignal());
    });

    // reactive button state evaluation
    this.canSubmit = computed(() => {
      return this.formFieldStatus() === 'VALID' && !this.isUserNameTaken() && !this.isEmailAddressTaken()
    });
  };

  // button event execution
  protected onSubmit() {
    if (this.userForm.valid) {
      this.userService.addUser(this.userForm)
    } else {
      alert('Bitte alle Felder korrekt ausfüllen.');
    }
  };

  // helper methods for evaluation
  protected isNameTaken(name: string): boolean {
    return this.users()?.some(
      user => user.userName.toLowerCase() === name.toLowerCase()
    ) ?? false;
  }
  protected isEmailTaken(address: string) {
    return this.users()?.some(
      user => user.eMailAddress.toLowerCase() === address.toLowerCase()
    ) ?? false;
  }
  protected searchUsers(name: string): User[] | undefined {
    return this.users()?.filter(
      user => user.userName.toLowerCase() === name.toLowerCase()
    );
  }

  // triggers effect when canSubmit is reevaluated - only for evaluation
  protected countCanSubmitEvaluation = effect(() => {
    this.canSubmit();
    this.counter.update(v => v + 1);
    console.log(`canSubmit Signal recomputed ${this.counter()} times`);
  });
}
