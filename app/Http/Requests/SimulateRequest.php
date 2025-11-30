<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SimulateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => [
                'required',
                'numeric',
                'min:100', // Minimum $100
                'max:10000000', // Maximum $10 million
            ],
            'symbol' => [
                'required',
                'string',
                'max:10',
                'regex:/^[A-Z0-9]+$/', // Only uppercase letters and numbers
            ],
            'start_date' => [
                'required',
                'date',
                'before_or_equal:today',
                'after:2000-01-01', // Reasonable date range
            ],
            'end_date' => [
                'nullable',
                'date',
                'before_or_equal:today',
                'after:start_date',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Vui lòng nhập số tiền đầu tư',
            'amount.numeric' => 'Số tiền đầu tư phải là số',
            'amount.min' => 'Số tiền đầu tư tối thiểu là $100',
            'amount.max' => 'Số tiền đầu tư tối đa là $10,000,000',
            
            'symbol.required' => 'Vui lòng nhập mã cổ phiếu',
            'symbol.string' => 'Mã cổ phiếu không hợp lệ',
            'symbol.max' => 'Mã cổ phiếu không được quá 10 ký tự',
            'symbol.regex' => 'Mã cổ phiếu chỉ được chứa chữ in hoa và số',
            
            'start_date.required' => 'Vui lòng chọn ngày bắt đầu',
            'start_date.date' => 'Ngày bắt đầu không hợp lệ',
            'start_date.before_or_equal' => 'Ngày bắt đầu không được trong tương lai',
            'start_date.after' => 'Ngày bắt đầu phải sau năm 2000',
            
            'end_date.date' => 'Ngày kết thúc không hợp lệ',
            'end_date.before_or_equal' => 'Ngày kết thúc không được trong tương lai',
            'end_date.after' => 'Ngày kết thúc phải sau ngày bắt đầu',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert symbol to uppercase
        if ($this->has('symbol')) {
            $this->merge([
                'symbol' => strtoupper($this->symbol),
            ]);
        }
    }
}
