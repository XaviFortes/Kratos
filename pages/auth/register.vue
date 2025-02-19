<template>
    <div class="max-w-md mx-auto mt-12">
      <h1 class="text-2xl font-bold mb-6">Create Account</h1>
      <form @submit.prevent="register">
        <div class="space-y-4">
          <input v-model="form.name" type="text" placeholder="Full Name" required>
          <input v-model="form.email" type="email" placeholder="Email" required>
          <input v-model="form.password" type="password" placeholder="Password" required>
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded">Create Account</button>
        </div>
      </form>
    </div>
</template>
  
<script setup>
  const form = reactive({
    name: '',
    email: '',
    password: ''
  });
  
  const register = async () => {
    try {
      const { data } = await useFetch('/api/auth/register', {
        method: 'POST',
        body: form
      });
      
      // Redirect to dashboard
      await navigateTo('/dashboard');
    } catch (error) {
      alert(error.message);
    }
  };
</script>