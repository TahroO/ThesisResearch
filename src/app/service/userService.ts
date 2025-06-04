import {User} from '../model/user';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {FormGroup} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  protected users: Observable<User[]>;
  constructor(private http: HttpClient) {
    this.users = this.http.get<User[]>('/data/users.json')
  }

  isNameTaken(name: string) {
    return this.users.pipe(
      map(users =>
        users.some(user => user.userName.toLowerCase() === name.toLowerCase())
      )
    );
  }


  isEmailTaken(address: string) {
    return this.users.pipe(
      map(users =>
        users.some(user => user.eMailAddress.toLowerCase() === address.toLowerCase())
      )
    );
  }

  searchUsers(name: string): Observable<User[]> {
    return this.users.pipe(
      map(users => users.filter(user =>
        user.userName.toLowerCase().includes(name.toLowerCase())
      ))
    );
  }

  addUser(userForm: FormGroup) {
    alert("User " + userForm.get("username")?.value + " would have been added! (No POST available)");
  }
}
