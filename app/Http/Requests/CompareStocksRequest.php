<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompareStocksRequest extends FormRequest
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
                'min:1000000', // Minimum 1 million VND
                'max:10000000000', // Maximum 10 billion VND
            ],
            'symbols' => [
                'required',
                'array',
                'min:2', // At least 2 stocks to compare
                'max:5', // Maximum 5 stocks
            ],
            'symbols.*' => [
                'required',
                'string',
                'max:10',
                'regex:/^[A-Z0-9]+$/',
                'distinct', // No duplicate symbols
            ],
            'start_date' => [
                'required',
                'date',
                'before_or_equal:today',
                'after:2000-01-01',
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
            'amount.min' => 'Số tiền đầu tư tối thiểu là 1,000,000 VND',
            'amount.max' => 'Số tiền đầu tư tối đa là 10,000,000,000 VND',
            
            'symbols.required' => 'Vui lòng chọn các mã cổ phiếu',
            'symbols.array' => 'Danh sách mã cổ phiếu không hợp lệ',
            'symbols.min' => 'Vui lòng chọn ít nhất 2 mã cổ phiếu để so sánh',
            'symbols.max' => 'Chỉ có thể so sánh tối đa 5 mã cổ phiếu',
            
            'symbols.*.required' => 'Mã cổ phiếu không được để trống',
            'symbols.*.string' => 'Mã cổ phiếu không hợp lệ',
            'symbols.*.max' => 'Mã cổ phiếu không được quá 10 ký tự',
            'symbols.*.regex' => 'Mã cổ phiếu chỉ được chứa chữ in hoa và số',
            'symbols.*.distinct' => 'Không được chọn trùng mã cổ phiếu',
            
            'start_date.required' => 'Vui lòng chọn ngày bắt đầu',
            'start_date.date' => 'Ngày bắt đầu không hợp lệ',
            'start_date.before_or_equal' => 'Ngày bắt đầu không được trong tương lai',
            'start_date.after' => 'Ngày bắt đầu phải sau năm 2000',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert all symbols to uppercase
        if ($this->has('symbols') && is_array($this->symbols)) {
            $this->merge([
                'symbols' => array_map('strtoupper', $this->symbols),
            ]);
        }
    }
}
