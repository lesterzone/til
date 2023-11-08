When working with [devise](https://github.com/heartcombo/devise/releases/tag/v4.9.3) we can create a _Parent_ model associated to `resource`.

Use case:
    - Create an Organization model when creating user

```rb
# models/organization.rb
# assuming you have User model with devise
accepts_nested_attributes_for :users
```

We have to generate views and controllers, modify routes to allow new controllers

```rb
# config/routes.rb
devise_for :users, controllers: { sessions: 'users/sessions', registrations: 'users/registrations' }
```

```rb
  # app/controllers/users/registrations_controller.rb
  # GET /resource/sign_up
  def new
    build_resource({})
    resource.build_organization
    respond_with self.resource
  end

  # POST /resource
  def create
    super do |user|
      # build your organization object here
      user.save!
    end
  end
```

```erb
#
<%= form_for(resource, as: resource_name, url: registration_path(resource_name), class: "") do |f| %>
  <%= f.fields_for :organization do |org_fields| %>

    <div class="form-group">
      <%= org_fields.label :some_field %><br />

      <%= org_fields.text_field :some_field,
        autofocus: true,
        autocomplete: "some_field",
      %>
      <%= inline_errors(resource.organization, :some_field) %>
    </div>
  <% end %>

  <div class="form-group">
    <%= f.label :email %><br />
    <%= f.email_field :email,
      autofocus: true,
      autocomplete: "email",
    %>

    <%= inline_errors(resource, :email) %>
  </div>
<% end %>
```

Bonus point, inline errors :D

```rb
# https://stackoverflow.com/questions/54477528/rails-form-with-display-inline-error-message
  def inline_errors(model, model_attribute)
    result = ""
    if model.errors[model_attribute].any?
      model.errors[model_attribute].uniq.each do |message|
        result += "<li>#{message}</li>"
      end
    end

    "<ul class='text-danger'>#{result}</ul>".html_safe
  end
```